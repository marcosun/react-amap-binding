import get from "lodash/get";

export default function getModified(obj: any, path: string, defaultsTo?: any) {
  const value = get(obj, path, defaultsTo);

  if (!value && defaultsTo !== undefined) {
    return defaultsTo;
  }

  return value;
}
