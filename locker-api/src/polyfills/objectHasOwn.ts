const objectWithHasOwn = Object as typeof Object & {
  hasOwn?: (obj: object, prop: PropertyKey) => boolean;
};

if (!objectWithHasOwn.hasOwn) {
  objectWithHasOwn.hasOwn = function hasOwn(
    obj: object,
    prop: PropertyKey,
  ): boolean {
    return Object.prototype.hasOwnProperty.call(Object(obj), prop);
  };
}
