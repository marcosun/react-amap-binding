import cloneDeep from './cloneDeep';

test('null', () => {
  expect(cloneDeep(null)).toBeNull();
});

test('undefined', () => {
  expect(cloneDeep(undefined)).toBeUndefined();
});

test('boolean', () => {
  expect(cloneDeep(true)).toBeTruthy();
});

test('number', () => {
  expect(cloneDeep(1)).toBe(1);
});

test('string', () => {
  expect(cloneDeep('test')).toBe('test');
});

test('array', () => {
  const data = [
    [120.216339,30.196152],
    [120.21656,30.196159],
  ];
  expect(cloneDeep(data)).toEqual(data); // Checks every field of an array or object
  expect(cloneDeep(data)).not.toBe(data);// Not exact equality
});

test('Copy all if the second param is undefined', () => {
  const data = {
    center: [120.216339,30.196152],
    zoom: 12,
  };
  expect(cloneDeep(data)).toEqual(data);
  expect(cloneDeep(data)).not.toBe(data);
  expect(cloneDeep(data).center).not.toBe(data.center);
});

test('Copy path field', () => {
  const data = {
    path: [[120.216339,30.196152],[120.21656,30.196159]],
    center: [120.216339,30.196152],
    zoom: 12,
  };
  expect(cloneDeep(data, ['path'])).toEqual(data);
  expect(cloneDeep(data, ['path'])).not.toBe(data);
  expect(cloneDeep(data, ['path']).path).not.toBe(data.path);
  expect(cloneDeep(data, ['path']).center).toBe(data.center);
});


test('Shallow copy if the key does not exist', () => {
  const data = {
    path: [[120.216339,30.196152],[120.21656,30.196159]],
    center: [120.216339,30.196152],
    zoom: 12,
  };
  expect(cloneDeep(data, ['others'])).toEqual(data);
  expect(cloneDeep(data, ['others'])).not.toBe(data);
});
