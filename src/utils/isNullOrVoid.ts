export default function isNullOrVoid(target: any) {
  if (target === void 0 || target === null) return true;
  return false;
}