import React, { useCallback, useContext, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { ColumnSortAndOrderContext } from "contexts/ColumnSortAndOrderContext";
import { SortedDataContext } from "contexts/SortedDataContext";
import { TableColumnType } from "allTypes";

import { IconButton } from "./IconButton";

const DRAGGABLE_COLUMN_TYPE = "column";

const getSortIcon = (column: TableColumnType) => {
  return column.isSorting
    ? column.sortType === "asc"
      ? "/images/arrow-down.png"
      : "/images/arrow-up.png"
    : column.sortType === "asc"
    ? "/images/disabled-arrow-down.png"
    : "/images/disabled-arrow-up.png";
};

type DraggableColumnProps = {
  column: TableColumnType;
  index: number;
};

export const DraggableColumn: React.FC<DraggableColumnProps> = ({
  column,
  index,
}) => {
  const ref = useRef<HTMLTableCellElement>(null);

  const { onSortedColumnChange } = useContext(SortedDataContext);
  const { columns, onColumnOrderChange } = useContext(
    ColumnSortAndOrderContext
  );

  const onColumnMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updatedColumns = [...columns];
      const [movedColumn] = updatedColumns.splice(fromIndex, 1);
      updatedColumns.splice(toIndex, 0, movedColumn);
      onColumnOrderChange(updatedColumns);
    },
    [columns, onColumnOrderChange]
  );

  const [, drop] = useDrop({
    accept: DRAGGABLE_COLUMN_TYPE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      onColumnMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: DRAGGABLE_COLUMN_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <th
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        border: 0,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      draggable="true"
      role="columnheader"
      aria-label="draggable column"
    >
      <div className="flex alignCenter spacing-small">
        {column.label}
        <IconButton
          disabled={!column.isSorting}
          imgSrc={getSortIcon(column)}
          imgAlt={column.sortType}
          onClick={() =>
            onSortedColumnChange(
              column.key,
              column.isSorting && column.sortType === "asc" ? "desc" : "asc"
            )
          }
          aria-disabled={!column.isSorting ? "true" : "false"}
          ariaLabel={`Sort by ${column.label}`}
        />
      </div>
    </th>
  );
};
