/**
 * Widget Grid Component
 * Displays widgets in responsive grid
 */

'use client';

import React from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetContainer } from '@/components/widgets/Widget';
import { useWidgetStore } from '@/store/widgetStore';
import { Widget } from '@/store/types';

interface SortableWidgetCardProps {
  widget: Widget;
}

const SortableWidgetCard: React.FC<SortableWidgetCardProps> = ({ widget }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-96 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-90 ring-2 ring-blue-400 shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <WidgetContainer widget={widget} />
    </div>
  );
};

export const WidgetGrid: React.FC = () => {
  const widgets = useWidgetStore((state) => state.widgets);
  const layout = useWidgetStore((state) => state.layout);
  const reorderWidgets = useWidgetStore((state) => state.reorderWidgets);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      reorderWidgets(String(active.id), String(over.id));
    }
  };

  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No widgets added yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Click "Add Widget" to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={widgets.map((widget) => widget.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className={`grid gap-${layout.gap}`}
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(400px, 1fr))`,
          }}
        >
          {widgets.map((widget) => (
            <SortableWidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
