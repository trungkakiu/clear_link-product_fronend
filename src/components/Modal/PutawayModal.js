import React, { useState, useEffect, useMemo, useContext } from "react";
import { createPortal } from "react-dom"; // BỔ SUNG THƯ VIỆN NÀY
import { Modal, Button, Badge, Spinner } from "@themesberg/react-bootstrap";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCheck,
  faArrowsAlt,
  faLayerGroup,
  faInfoCircle,
  faSync,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import Otp_verify_dynamic from "./Otp_verify_dynamic";

// --- COMPONENT 1: PREVIEW TRÁI ---
const PreviewTask = ({ task }) => {
  const locationText = task.location_details
    ? `Tầng ${task.location_details.level} - Ô ${task.location_details.slot_index}`
    : "Chưa phân bổ";

  return (
    <div className="p-3 mb-3 bg-white border border-gray-200 rounded shadow-sm w-100 opacity-75">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong className="text-secondary fs-6">{task.batch_id}</strong>
        <Badge bg="secondary" text="light" className="px-2 py-1">
          {task.suggested_quantity} Thùng
        </Badge>
      </div>
      <div className="text-muted small mb-2 d-flex justify-content-between">
        <span>
          <FontAwesomeIcon icon={faBox} className="me-2" />
          {task.product_id}
        </span>
        <span className="text-danger fw-bold">
          <FontAwesomeIcon icon={faCube} className="me-1" />
          {parseFloat(task.suggested_volume || 0).toFixed(2)} m³
        </span>
      </div>
      <div className="mt-2 pt-2 border-top text-primary small fw-bold d-flex align-items-center">
        <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
        Vị trí: {locationText}
      </div>
    </div>
  );
};

// --- COMPONENT 2A: GIAO DIỆN HỘP THUẦN TÚY ---
const BoxUI = React.forwardRef(({ task, isOverlay, style, ...props }, ref) => {
  const volumeShow = (
    parseFloat(task.suggested_volume) ||
    parseFloat(task.suggested_quantity) * parseFloat(task.box_volume) ||
    0
  ).toFixed(2);

  return (
    <div
      ref={ref}
      style={{
        minHeight: "70px",
        width: isOverlay ? "130px" : "100%", // Cố định kích thước khi bốc lên
        border: "2px dashed #0dcaf0",
        pointerEvents: isOverlay ? "none" : "auto", // Bóng không cản chuột để rớt được xuống kệ
        margin: isOverlay ? 0 : undefined,
        ...style,
      }}
      {...props}
      className={`bg-info text-dark rounded p-2 shadow-sm d-flex flex-column align-items-center justify-content-center transition-all ${
        isOverlay
          ? "scale-105 shadow-lg border-primary z-50 bg-opacity-100 bg-info"
          : "bg-opacity-25 mb-2"
      }`}
      title={`Thể tích: ${volumeShow} m³`}
    >
      <FontAwesomeIcon icon={faBox} size="lg" className="text-primary mb-1" />
      <span
        className="text-truncate fw-bold text-center"
        style={{ fontSize: "0.75rem", maxWidth: "100%" }}
      >
        {task.batch_id}
      </span>
      <Badge bg="primary" className="mt-1" style={{ fontSize: "0.65rem" }}>
        {task.suggested_quantity} Hộp
      </Badge>
    </div>
  );
});

// --- COMPONENT 2B: BỌC LOGIC KÉO THẢ VÀO HỘP ---
const DraggableChildItem = ({ task }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: task.task_id,
      data: task,
    });

  const style = {
    opacity: isDragging ? 0.3 : 1, // Làm mờ nhẹ hộp gốc để chừa chỗ cho bóng mờ
    transform: CSS.Translate.toString(transform),
    cursor: "grab",
  };

  return (
    <BoxUI
      ref={setNodeRef}
      style={style}
      task={task}
      {...listeners}
      {...attributes}
    />
  );
};

const DroppableSlot = ({ slot, activeTask, currentTasks }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: slot?.slot_id,
    data: slot,
  });

  const baseCapacityVol =
    (parseFloat(slot.available_capacity) || 0) +
    (parseFloat(slot.initial_suggested_volume) || 0);

  const currentUsedVol = currentTasks.reduce(
    (sum, t) =>
      sum +
      (parseFloat(t.suggested_volume) ||
        parseFloat(t.suggested_quantity) * parseFloat(t.box_volume) ||
        0),
    0,
  );
  const realAvailableVol = baseCapacityVol - currentUsedVol;

  const neededVol = activeTask
    ? parseFloat(activeTask.suggested_volume) ||
      parseFloat(activeTask.suggested_quantity) *
        parseFloat(activeTask.box_volume) ||
      0
    : 0;

  const canDrop = activeTask
    ? activeTask.suggested_slot_id === slot.slot_id ||
      realAvailableVol >= neededVol
    : true;

  let slotBg = "bg-white";
  let borderColor = "border-gray-300";
  let isTarget = false;

  if (isOver) {
    isTarget = true;
    slotBg = canDrop ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10";
    borderColor = canDrop
      ? "border-success border-2"
      : "border-danger border-2";
  } else if (currentTasks.length > 0) {
    slotBg = "bg-primary bg-opacity-10";
    borderColor = "border-primary";
  }

  // --- LOGIC MỚI BỔ SUNG Ở ĐÂY ---
  const maxCap = parseFloat(slot.max_capacity) || 1;
  // Tính thể tích hàng CŨ đã có sẵn trên kệ (Dùng sai số 0.01 để làm tròn)
  const existingUsedVol = Math.max(0, maxCap - baseCapacityVol);
  const hasExistingItems = existingUsedVol > 0.01;

  // Progress bar giờ sẽ cộng dồn cả Hàng Cũ + Hàng Mới
  const totalUsedVol = existingUsedVol + currentUsedVol;
  const fillPercentage = maxCap > 0 ? (totalUsedVol / maxCap) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      className={`p-2 rounded position-relative d-flex flex-column ${slotBg} border ${borderColor}`}
      style={{
        minHeight: "150px",
        flex: "1 1 0",
        minWidth: "130px",
        transition: "all 0.2s",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold text-dark">Ô {slot.slot_index}</span>
        <span
          className={`small fw-bold ${realAvailableVol < 0 ? "text-danger" : "text-muted"}`}
        >
          Trống: {parseFloat(realAvailableVol).toFixed(2)} m³
        </span>
      </div>

      <div
        className={`flex-grow-1 rounded d-flex flex-column p-1 mb-2 ${
          currentTasks.length === 0 && !hasExistingItems
            ? "bg-light border"
            : ""
        } justify-content-center align-items-center`}
      >
        {/* NẾU ĐÃ CÓ HÀNG CŨ THÌ HIỂN THỊ CẢNH BÁO NÀY */}
        {hasExistingItems && (
          <div className="w-100 px-1 mb-2 align-self-start">
            <Badge
              bg="warning"
              text="dark"
              className="w-100 py-2 shadow-sm border border-warning"
              style={{
                fontSize: "0.75rem",
                whiteSpace: "normal",
                lineHeight: "1.4",
              }}
            >
              CÓ SẴN HÀNG
            </Badge>
          </div>
        )}

        {currentTasks.map((t, index) => (
          <DraggableChildItem
            key={t.task_id || `child-${slot.slot_id}-${index}`}
            task={t}
          />
        ))}

        {/* CHỈ HIỂN THỊ "KHOANG TRỐNG" KHI CẢ HÀNG MỚI LẪN HÀNG CŨ ĐỀU TRỐNG TRƠN */}
        {currentTasks.length === 0 && !hasExistingItems && !isTarget && (
          <span className="text-muted small opacity-50 font-monospace">
            Khoang trống
          </span>
        )}
      </div>

      <div
        className="progress mt-auto"
        style={{ height: "6px", backgroundColor: "#e9ecef" }}
      >
        <div
          className={`progress-bar ${fillPercentage > 90 ? "bg-danger" : "bg-primary"}`}
          role="progressbar"
          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function PutawayModal({
  show,
  onHide,
  apiData,
  onDynamicUpdate,
  isPayment,
  openQrpayment,
  ship_id,
  closeReload,
  load,
}) {
  const { User } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [slots, setSlots] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalstate, setmodalstate] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const fetchInitialData = async () => {
    try {
      const res = await api_request.getPushTaskAPI(User, ship_id);
      if (res.RC === 200) {
        setTasks(res.RD.suggested_plan || []);
        setSlots(res.RD.available_slots || []);
      } else {
        toast.error("Lỗi tải dữ liệu ban đầu!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống khi tải dữ liệu!");
    }
  };

  useEffect(() => {
    if (load) {
      fetchInitialData();
    } else {
      setTasks([]);
      setSlots([]);
    }
  }, [load, ship_id]);

  const onConfirmSave = async (challenge_code) => {
    try {
      const res = await api_request.confirm_put_away(
        User,
        ship_id,
        tasks,
        challenge_code,
      );
      return res;
    } catch (error) {
      toast.error("Lỗi hệ thống!");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!apiData || !apiData.suggested_plan) return;

    const initTasks = apiData.suggested_plan.map((t, index) => ({
      ...t,
      task_id: t.id || t.task_id || `TASK_GEN_${t.batch_id}_${index}`,
    }));

    const initSlots = apiData.available_slots.map((s) => ({
      ...s,
      initial_suggested_volume: 0,
    }));

    initTasks.forEach((t) => {
      let slot = initSlots.find((s) => s.slot_id === t.suggested_slot_id);
      if (!slot) {
        slot = {
          slot_id: t.suggested_slot_id,
          slot_code: t.location_details?.slot_code || "N/A",
          zone_name: t.location_details?.zone_name || "Chưa xác định",
          rack_code: t.location_details?.rack_code || "Chưa xác định",
          level: t.location_details?.level || 1,
          slot_index: t.location_details?.slot_index || 1,
          max_capacity: 0,
          available_capacity: 0,
          initial_suggested_volume: 0,
        };
        initSlots.push(slot);
      }

      const taskVol =
        parseFloat(t.suggested_volume) ||
        parseFloat(t.suggested_quantity) * parseFloat(t.box_volume) ||
        0;
      slot.initial_suggested_volume += taskVol;
      slot.max_capacity = Math.max(
        parseFloat(slot.max_capacity) || 0,
        slot.initial_suggested_volume +
          (parseFloat(slot.available_capacity) || 0),
      );
    });

    setTasks(initTasks);
    setSlots(initSlots);
  }, [apiData]);

  const warehouseMap = useMemo(() => {
    const rackMap = {};
    slots.forEach((slot) => {
      const rackKey = `${slot.zone_name} - Kệ ${
        slot.rack_code !== "Chưa xác định" ? slot.rack_code : "Chưa gắn tên"
      }`;
      if (!rackMap[rackKey]) rackMap[rackKey] = { levels: {} };
      if (!rackMap[rackKey].levels[slot.level])
        rackMap[rackKey].levels[slot.level] = [];
      rackMap[rackKey].levels[slot.level].push(slot);
    });

    Object.keys(rackMap).forEach((rack) => {
      const sortedLevels = Object.keys(rackMap[rack].levels).sort(
        (a, b) => b - a,
      );
      sortedLevels.forEach((lvl) => {
        rackMap[rack].levels[lvl].sort((a, b) => a.slot_index - b.slot_index);
      });
      rackMap[rack].sortedLevels = sortedLevels;
    });

    return rackMap;
  }, [slots]);

  const handleDragStart = (event) => {
    if (isUpdating) return;
    const { active } = event;
    const task = tasks.find((t) => t.task_id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const targetSlotId = over.id;
    const targetSlot = slots.find((s) => s.slot_id === targetSlotId);
    const draggedTask = tasks.find((t) => t.task_id === taskId);

    if (!targetSlot || !draggedTask) return;
    if (draggedTask.suggested_slot_id === targetSlotId) return;

    const baseCapacityVol =
      (parseFloat(targetSlot.available_capacity) || 0) +
      (parseFloat(targetSlot.initial_suggested_volume) || 0);

    const tasksInTarget = tasks.filter(
      (t) => t.suggested_slot_id === targetSlotId,
    );
    const currentUsedVol = tasksInTarget.reduce(
      (sum, t) =>
        sum +
        (parseFloat(t.suggested_volume) ||
          parseFloat(t.suggested_quantity) * parseFloat(t.box_volume) ||
          0),
      0,
    );
    const realAvailableVol = baseCapacityVol - currentUsedVol;
    const neededVol =
      parseFloat(draggedTask.suggested_volume) ||
      parseFloat(draggedTask.suggested_quantity) *
        parseFloat(draggedTask.box_volume) ||
      0;

    if (realAvailableVol < neededVol) {
      const force = window.confirm(
        `[CẢNH BÁO QUÁ TẢI THỂ TÍCH]\nÔ số ${targetSlot.slot_index} chỉ còn trống ${parseFloat(realAvailableVol).toFixed(2)} m³.\nLô hàng bạn kéo vào chiếm ${parseFloat(neededVol).toFixed(2)} m³.\nBạn có chắc chắn muốn ép ghi đè vị trí này không?`,
      );
      if (!force) return;
    }

    const previousTasks = [...tasks];
    const newTasks = tasks.map((t) => {
      if (t.task_id === taskId) {
        return {
          ...t,
          suggested_slot_id: targetSlotId,
          location_details: {
            zone_name: targetSlot.zone_name,
            rack_code: targetSlot.rack_code,
            slot_code: targetSlot.slot_code,
            level: targetSlot.level,
            slot_index: targetSlot.slot_index,
          },
        };
      }
      return t;
    });
    setTasks(newTasks);

    if (onDynamicUpdate) {
      setIsUpdating(true);
      try {
        await onDynamicUpdate(draggedTask, targetSlot, newTasks);
        toast.success(
          `Đã cập nhật: Chuyển lô ${draggedTask.batch_id} sang ô ${targetSlot.slot_code}`,
        );
      } catch (error) {
        toast.error("Lỗi đồng bộ Backend! Khôi phục vị trí cũ.");
        setTasks(previousTasks);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered>
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title className="fw-bold fs-5 d-flex align-items-center">
          <FontAwesomeIcon icon={faArrowsAlt} className="me-2 text-warning" />
          Sơ đồ xếp dỡ hàng hóa thực tế
          {isUpdating && (
            <Spinner
              animation="border"
              variant="warning"
              size="sm"
              className="ms-3"
            />
          )}
        </Modal.Title>
      </Modal.Header>

      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => closeReload()}
        message={"Xác nhận kịch bản nhập kho!"}
        onSuccess={(challenge_code) => onConfirmSave(challenge_code)}
        show={modalstate}
        title={"PIN VERIFY"}
      />

      <Modal.Body
        className="p-0 bg-white d-flex position-relative"
        style={{ height: "80vh" }}
      >
        <div
          className="border-end p-3 bg-light overflow-auto d-flex flex-column"
          style={{ width: "25%", minWidth: "280px" }}
        >
          <div className="w-100 mb-3 border-bottom pb-2">
            <h6 className="fw-bold text-uppercase text-dark m-0">
              Tổng quan ({tasks.length} Lô)
            </h6>
            <small className="text-muted">
              <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Chỉ xem
            </small>
          </div>
          <div className="w-100 d-flex flex-column gap-2">
            {tasks.map((task, index) => (
              <PreviewTask
                key={`preview-${task.task_id || index}`}
                task={task}
              />
            ))}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="p-4 overflow-auto bg-white position-relative flex-grow-1"
            style={{ width: "75%" }}
          >
            {isUpdating && (
              <div
                className="position-absolute w-100 h-100 top-0 start-0 bg-white opacity-50 z-3"
                style={{ zIndex: 1000 }}
              ></div>
            )}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold text-uppercase text-secondary mb-1">
                  Bản đồ kho tương tác
                </h6>
                <small className="text-muted">
                  Kéo thả các Hộp hàng để đổi vị trí cất. Hệ thống sẽ tự kiểm
                  tra Thể tích (m³).
                </small>
              </div>
              {isUpdating && (
                <Badge
                  bg="warning"
                  text="dark"
                  className="d-flex align-items-center px-3 py-2"
                >
                  <FontAwesomeIcon icon={faSync} spin className="me-2" /> Đang
                  đồng bộ...
                </Badge>
              )}
            </div>

            {Object.keys(warehouseMap).map((rackKey) => {
              const rack = warehouseMap[rackKey];
              return (
                <div
                  key={rackKey}
                  className="mb-5 border rounded shadow-sm bg-white"
                >
                  <div className="bg-secondary text-white p-2 rounded-top fw-bold px-3">
                    {rackKey}
                  </div>
                  <div className="p-3 bg-light">
                    {rack.sortedLevels.map((level) => (
                      <div
                        key={level}
                        className="d-flex align-items-stretch mb-3 shadow-sm rounded"
                      >
                        <div
                          className="bg-dark text-white d-flex align-items-center justify-content-center fw-bold rounded-start"
                          style={{ width: "80px", minWidth: "80px" }}
                        >
                          Tầng {level}
                        </div>
                        <div className="d-flex flex-grow-1 gap-2 bg-white border border-start-0 p-2 rounded-end overflow-auto">
                          {rack.levels[level].map((slot) => {
                            const currentTasks = tasks.filter(
                              (t) => t.suggested_slot_id === slot.slot_id,
                            );
                            return (
                              <DroppableSlot
                                key={slot.slot_id}
                                slot={slot}
                                activeTask={activeTask}
                                currentTasks={currentTasks}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {typeof document !== "undefined" &&
            createPortal(
              <DragOverlay dropAnimation={null}>
                {activeTask ? (
                  <BoxUI
                    task={activeTask}
                    isOverlay={true}
                    style={{
                      cursor: "grabbing",
                      zIndex: 9999,
                      width: "150px",
                    }}
                  />
                ) : null}
              </DragOverlay>,
              document.body,
            )}
        </DndContext>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className="fw-bold px-4"
          disabled={isUpdating}
        >
          Đóng
        </Button>
        {isPayment ? (
          <Button
            variant="primary"
            onClick={() => setmodalstate(true)}
            className="fw-bold px-4 shadow-sm"
            disabled={isUpdating}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Hoàn tất nhập kho
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => openQrpayment()}
            className="fw-bold px-4 shadow-sm"
            disabled={isUpdating}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Thanh toán & Nhập kho
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
