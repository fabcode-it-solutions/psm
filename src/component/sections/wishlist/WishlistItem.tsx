import { BUTTON_BASE_CLASSES, WishlistItemProps } from "@/types/wishlist.types";
import React, { useCallback } from "react";

export const WishlistItem = React.memo<WishlistItemProps>(
  ({
    item,
    index,
    includeItem,
    onAdd,
    onRemove,
    isAddLoading,
    isRemoveLoading,
    activeIndex,
  }) => {
    const handleAdd = useCallback(() => {
      if (!isAddLoading) {
        onAdd({ categoryId: item.id, index });
      }
    }, [item.id, index, onAdd, isAddLoading]);

    const handleRemove = useCallback(() => {
      if (!isRemoveLoading && includeItem) {
        onRemove({ index, itemId: includeItem.itemId });
      }
    }, [index, includeItem, onRemove, isRemoveLoading]);

    const isCurrentlyLoading =
      (isAddLoading || isRemoveLoading) && activeIndex === index;

    return (
      <div className="flex items-center justify-between last:border-b-0 p-3 rounded-md border-b border-light-200">
        <div>
          {index + 1}. {item.name}
        </div>

        {includeItem ? (
          <button
            onClick={handleRemove}
            disabled={isRemoveLoading}
            className={BUTTON_BASE_CLASSES}
            aria-label={`Remove ${item.name} from wishlist`}
          >
            {isCurrentlyLoading ? "Removing..." : "Remove"}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isAddLoading}
            className={BUTTON_BASE_CLASSES}
            aria-label={`Add ${item.name} to wishlist`}
          >
            {isCurrentlyLoading ? "Adding..." : "Add"}
          </button>
        )}
      </div>
    );
  }
);

WishlistItem.displayName = "WishlistItem";
