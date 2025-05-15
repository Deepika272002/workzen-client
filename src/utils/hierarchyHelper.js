export const canAssignTaskTo = (assignerLevel, assigneeLevel) => {
  if (!assignerLevel || !assigneeLevel) {
    return false;
  }

  // Lower level number means higher in hierarchy (e.g., 1 is higher than 2)
  return assignerLevel < assigneeLevel;
}; 