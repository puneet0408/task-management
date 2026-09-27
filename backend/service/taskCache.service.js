const normalizeQueryParam = (value) => {
  if (!value) return "all";

  const array = Array.isArray(value)
    ? value
    : value.split(",");

  return array
    .map(String)
    .sort()
    .join(",");
};

export const buildTaskCacheKey = ({
  projectId,
  sprintId,
  assignedTo,
  taskStatus,
  tag,
  priority,
  type,
  searchValue,
  sortFIeld,
  sortDirection,
  filter,
  offset,
  limit,
}) => {
  return [
    "tasks",
    `project:${projectId}`,
    `sprint:${normalizeQueryParam(sprintId)}`,
    `assignedTo:${normalizeQueryParam(assignedTo)}`,
    `status:${normalizeQueryParam(taskStatus)}`,
    `tag:${normalizeQueryParam(tag)}`,
    `priority:${normalizeQueryParam(priority)}`,
    `type:${normalizeQueryParam(type)}`,
    `search:${searchValue?.trim().toLowerCase() || "all"}`,
    `filter:${filter || "all"}`,
    `sortField:${sortFIeld || "createdAt"}`,
    `sortDirection:${sortDirection || "desc"}`,
    `offset:${Number(offset) || 0}`,
    `limit:${Number(limit) || "all"}`,
  ].join(":");
};