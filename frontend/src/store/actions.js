import { parse } from "date-fns";

function genId () {
  return `${new Date().getTime()}-${(Math.random() * 1000000).toFixed()}`
}

function getStorageTasks () {
  return JSON.parse(localStorage.getItem('tasks') || '{}')
}

function storeTasks (tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

function dbArrayToObj (arr) {
  return Object.fromEntries(arr.map(item => [item.id, item]))
}

export default {
  sortTasks({ state }) {
    state.tasks.sort((a, b) => a.id - b.id);
  },
  async getTasks({ commit, dispatch }) {
    const tasks = Object.values(getStorageTasks())

    tasks.forEach((task) => {
      task.comments = Object.values(task.comments || {})
      task.dueDate = parse(task.dueDate)
    });

    commit("SAVE_TASKS", tasks);
    dispatch("sortTasks");
  },
  async saveTask({ commit, dispatch }, task) {
    const tasks = getStorageTasks()

    const storeTask = {
      ...task,
      id: genId(),
      comments: dbArrayToObj(task.comments)
    }
    tasks[storeTask.id] = storeTask

    storeTasks(tasks)

    commit("UPDATE_TASK", task);
    dispatch("sortTasks");
  },
  async updateTask({ commit, dispatch }, task) {
    const tasks = getStorageTasks()

    const storeTask = {
      ...task,
      comments: dbArrayToObj(task.comments)
    }
    tasks[storeTask.id] = storeTask

    storeTasks(tasks)

    commit("UPDATE_TASK", task);
    dispatch("sortTasks");
  },
  async deleteTask({ dispatch }, taskId) {
    const tasks = getStorageTasks()

    delete tasks[taskId]

    storeTasks(tasks)

    dispatch("getTasks");
  },
  async completeTask({ dispatch }, task) {
    task.status = !task.status;

    dispatch("updateTask", task);
  },
  async saveComment({ commit, dispatch }, { taskId, comment }) {
    const tasks = getStorageTasks()

    const task = tasks[taskId]
    if (task == null) {
      throw new Error('task not found')
    }

    comment = { ...comment, id: genId() }

    if (task.comments == null) {
      task.comments = {}
    }

    task.comments[comment.id] = comment

    storeTasks(tasks)

    commit(
      "UPDATE_TASK",
      {
        ...task,
        comments: Object.values(task.comments)
      }
    );
    dispatch("sortTasks");
  },
  async updateComment({ commit, dispatch }, comment) {
    const tasks = getStorageTasks()

    for (const task in tasks) {
      if (task.comments[comment.id] != null) {
        task.comments[comment.id] = { ...comment }
      }
    }

    storeTasks(tasks)

    commit("UPDATE_COMMENT", comment);
    dispatch("sortTasks");
  },
  async deleteComment({ dispatch }, commentId) {
    const tasks = getStorageTasks()

    for (const task in tasks) {
      delete (task.comments || {})[commentId]
    }

    storeTasks(tasks)

    dispatch("getTasks");
  }
};
