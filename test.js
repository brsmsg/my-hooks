let isMount = true;
// 指向当前执行hook
let workInProgressHook = null;

const fiber = {
  stateNode: APP,
  // 保存hooks
  memoizedState: null,
};

function schedule() {
  // 初始化，重新指向第一个hook
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}

function useState(initialState) {
  let hook;
  if (isMount) {
    // 首次渲染
    // 生成链表
    hook = {
      memoizedState: initialState,
      next: null,
      queue: {
        pending: null,
      },
    };
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    // 更新
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  // 产生新的状态，计算新的state
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    // 本次更新有新的update,
    // re: queue.pending指向最后一个update
    let firstUpdate = hook.queue.pending.next;

    // 遍历环状链表
    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next);

    hook.queue.pending = null;
  }

  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}

// setState方法
function dispatchAction(queue, action) {
  // 环状链表（因为更新有优先级, 需要随时调整表头）
  // demo中更新没有优先级
  const update = {
    action,
    next: null,
  };

  if (queue.pending === null) {
    // 当前hook没有需要触发的更新,
    update.next = update;
  } else {
    // 新更新插入环状链表
    // u0 -> u0
    // u1 -> u0
    update.next = queue.pending.next;
    // u0 -> u1
    queue.pending.next = update;
  }
  // queue.pending指向最后一个update
  queue.pending = update;

  // 触发调度更新
  schedule();
}

function APP() {
  const [num, updateNum] = useState(0);
  const [num1, updateNum1] = useState(0);
  const [num2, updateNum2] = useState(0);

  console.log("isMount? ", isMount);
  console.log("num: ", num);

  return {
    onClick() {
      updateNum((num) => num + 1);
      // updateNum((num) => num + 1);
    },
  };
}

window.app = schedule();
