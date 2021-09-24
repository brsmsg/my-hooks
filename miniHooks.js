const MyReact = (function () {
  let _val, _deps; //函数作用域中保存_val和依赖_deps
  return {
    render(Component) {
      const Comp = Component();
      Comp.render();
      return Comp;
    },
    useEffect(callback, depArray) {
      const hasNodeps = !depArray;
      const hasChangedDeps = _deps
        ? !depArray.every((el, i) => el === _deps[i])
        : true;
      if (hasNodeps || hasChangedDeps) {
        callback();
        _deps = depArray;
      }
    },
    useState(initialValue) {
      _val = _val || initialValue;
      function setState(newVal) {
        _val = newVal;
      }
      return [_val, setState];
    },
  };
})();

function Counter() {
  const [count, setCount] = MyReact.useState(0);
  MyReact.useEffect(() => {
    console.log("effect", count);
  }, [count]);
  return {
    click: () => setCount(count + 1),
    noop: () => setCount(count),
    render: () => console.log("render", { count }),
  };
}

let App;
App = MyReact.render(Counter);
App.click();
App = MyReact.render(Counter);
App.noop();
App = MyReact.render(Counter);
App.click();
App = MyReact.render(Counter);
