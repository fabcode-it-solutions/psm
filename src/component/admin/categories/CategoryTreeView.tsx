"use client";
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderTree, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash,
  Plus,
  Folder,
  FolderOpen
} from 'lucide-react';
import { Category } from '@/services/categoryService';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSubcategory: (parentCategory: Category) => void;
  loading?: boolean;
}

export function CategoryTreeView({ 
  categories, 
  onEdit, 
  onDelete, 
  onAddSubcategory,
  loading 
}: CategoryTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Build tree structure
  const buildTree = (categories: Category[]): CategoryTreeNode[] => {
    const categoryMap = new Map<number, CategoryTreeNode>();
    
    // Initialize all categories as nodes
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0,
      });
    });

    const rootNodes: CategoryTreeNode[] = [];

    // Build hierarchy and set levels
    const setLevels = (node: CategoryTreeNode, level: number) => {
      node.level = level;
      node.children.forEach(child => setLevels(child, level + 1));
    };

    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (!node) return;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Set levels for all nodes
    rootNodes.forEach(node => setLevels(node, 0));

    // Sort at each level
    const sortChildren = (node: CategoryTreeNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortChildren);
    };

    rootNodes.sort((a, b) => a.name.localeCompare(b.name));
    rootNodes.forEach(sortChildren);

    return rootNodes;
  };

  const treeData = buildTree(categories);

  const toggleExpanded = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(cat => cat.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (node: CategoryTreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = node.level * 24;

    return (
      <div key={node.id}>
        {/* Node Row */}
        <div 
          className="flex items-center justify-between py-2 px-3 hover:bg-gray-5/5 group border-b border-gray-5/10"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpanded(node.id)}
              className={`
                p-1 rounded transition-colors flex-shrink-0
                ${hasChildren 
                  ? 'text-gray-4 hover:text-light-100 hover:bg-gray-5/10' 
                  : 'invisible'
                }
              `}
            >
              {hasChildren && (
                isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {/* Category Icon */}
            <div className={`
              w-6 h-6 rounded flex items-center justify-center flex-shrink-0
              ${hasChildren ? 'bg-accent-100/10' : 'bg-gray-5/10'}
            `}>
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className={`w-3 h-3 ${hasChildren ? 'text-accent-100' : 'text-gray-4'}`} />
                ) : (
                  <Folder className={`w-3 h-3 ${hasChildren ? 'text-accent-100' : 'text-gray-4'}`} />
                )
              ) : (
                <FolderTree className="w-3 h-3 text-gray-4" />
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-light-100 font-medium font-sofia-sans truncate">
                  {node.name}
                </span>
                <code className="text-xs text-gray-4 bg-gray-5/10 px-1 py-0.5 rounded flex-shrink-0">
                  {node.slug}
                </code>
                {node.isCustom && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded flex-shrink-0">
                    Custom
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-gray-4 truncate mt-0.5">
                  {node.description}
                </p>
              )}
            </div>

            {/* Children Count */}
            {hasChildren && (
              <span className="text-xs text-gray-4 bg-gray-5/10 px-2 py-0.5 rounded-full flex-shrink-0">
                {node.children.length}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddSubcategory(node)}
              className="p-1 text-gray-4 hover:text-accent-100 hover:bg-accent-100/10 rounded transition-colors"
              title="Add subcategory"
            >
              <Plus className="w-3 h-3" />
            </button>
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded transition-colors">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 min-w-[140px] shadow-xl z-50"
                  sideOffset={5}
                >
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none text-sm">
                    <Eye className="w-3 h-3" />
                    <span className="font-sofia-sans">View</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none text-sm"
                    onClick={() => onEdit(node)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="font-sofia-sans">Edit</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none text-sm"
                    onClick={() => onDelete(node)}
                  >
                    <Trash className="w-3 h-3" />
                    <span className="font-sofia-sans">Delete</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent-100 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-4 font-sofia-sans">Loading category tree...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg">
        <div className="p-8 text-center">
          <FolderTree className="w-12 h-12 text-gray-4 mx-auto mb-4" />
          <h3 className="text-light-100 text-lg font-bold mb-2 font-supreme">No categories found</h3>
          <p className="text-gray-4 font-sofia-sans">Get started by creating your first category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-5/20">
        <h3 className="text-light-100 font-medium font-sofia-sans">Category Hierarchy</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-gray-4 hover:text-light-100 px-2 py-1 hover:bg-gray-5/10 rounded transition-colors font-sofia-sans"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-4 hover:text-light-100 px-2 py-1 hover:bg-gray-5/10 rounded transition-colors font-sofia-sans"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="max-h-96 overflow-y-auto">
        {treeData.map(node => renderNode(node))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-5/20 bg-gray-5/5">
        <p className="text-xs text-gray-4 font-sofia-sans">
          Showing {categories.length} categories in hierarchical view
        </p>
      </div>
    </div>
  );
}