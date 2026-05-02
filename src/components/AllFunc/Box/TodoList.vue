<template>
  <!-- 待办 -->
  <div class="todo-list__layout">
    <Transition name="fade" mode="out-in">
      <div v-if="todoData[0]" class="todo-list">
        <n-scrollbar class="scrollbar">
          <div class="all-todo">
            <div
              v-for="item in todoData"
              :key="item.id"
              class="todo-item"
              :class="{ completed: item.completed }"
              @click="toggleTodo(item)"
              @contextmenu="todoContextmenu($event, item)"
            >
              <n-checkbox
                :checked="item.completed"
                @click.stop
                @update:checked="(val) => setTodoStatus(item, val)"
              />
              <div class="todo-info">
                <div class="todo-title">{{ item.title }}</div>
                <div v-if="item.desc" class="todo-desc">{{ item.desc }}</div>
                <div class="todo-time">{{ item.time }}</div>
              </div>
            </div>
            <div class="todo-item add" @click="addTodoModalOpen">
              <SvgIcon iconName="icon-add" />
              <span class="name">添加待办</span>
            </div>
          </div>
        </n-scrollbar>
      </div>
      <div v-else class="not-todo">
        <span class="tip">暂无待办，去添加吧</span>
        <n-button strong secondary @click="addTodoModalOpen">
          <template #icon>
            <SvgIcon iconName="icon-add" />
          </template>
          添加待办
        </n-button>
      </div>
    </Transition>
  </div>
  <!-- 添加/编辑待办 -->
  <n-modal
    preset="card"
    v-model:show="addTodoModalShow"
    :title="`${addTodoModalType ? '编辑' : '添加'}待办`"
    :bordered="false"
    @mask-click="addTodoClose"
  >
    <n-form
      ref="addTodoRef"
      :rules="addTodoRules"
      :model="addTodoValue"
      :label-width="80"
    >
      <n-form-item label="ID" path="id">
        <n-input-number
          disabled
          placeholder="请输入ID"
          v-model:value="addTodoValue.id"
          style="width: 100%"
          :show-button="false"
        />
      </n-form-item>
      <n-form-item label="待办标题" path="title">
        <n-input
          clearable
          show-count
          maxlength="30"
          v-model:value="addTodoValue.title"
          placeholder="请输入待办标题"
        />
      </n-form-item>
      <n-form-item label="待办描述" path="desc">
        <n-input
          clearable
          type="textarea"
          :rows="3"
          maxlength="200"
          show-count
          v-model:value="addTodoValue.desc"
          placeholder="请输入待办描述（可选）"
        />
      </n-form-item>
      <n-form-item label="已完成" path="completed">
        <n-switch v-model:value="addTodoValue.completed" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="addTodoClose"> 取消 </n-button>
        <n-button strong secondary @click="addOrEditTodo">
          {{ addTodoModalType ? "编辑" : "添加" }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <!-- 待办右键菜单 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="large"
    :x="todoDropdownX"
    :y="todoDropdownY"
    :options="todoDropdownOptions"
    :show="todoDropdownShow"
    :on-clickoutside="
      () => {
        todoDropdownShow = false;
      }
    "
    @select="todoDropdownSelect"
  />
</template>

<script setup>
import { ref, nextTick, h, onMounted, watch } from "vue";
import {
  NButton,
  NScrollbar,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NDropdown,
  NCheckbox,
  NSwitch,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";

const site = siteStore();
const { todoData } = storeToRefs(site);

// 从 localStorage 加载待办数据
const loadTodoData = () => {
  try {
    const saved = localStorage.getItem("todoListData");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        site.setTodoData(parsed);
      }
    }
  } catch (e) {
    console.error("加载待办数据失败", e);
  }
};

// 保存待办数据到 localStorage
const saveTodoData = () => {
  try {
    localStorage.setItem("todoListData", JSON.stringify(todoData.value));
  } catch (e) {
    console.error("保存待办数据失败", e);
  }
};

onMounted(() => {
  loadTodoData();
});

watch(
  todoData,
  () => {
    saveTodoData();
  },
  { deep: true },
);

// 图标渲染
const renderIcon = (icon) => {
  return () => {
    return h(SvgIcon, { iconName: `icon-${icon}` }, null);
  };
};

// 添加待办数据
const addTodoRef = ref(null);
const addTodoModalShow = ref(false);
const addTodoModalType = ref(false); // false 添加 / true 编辑
const addTodoValue = ref({
  id: null,
  title: "",
  desc: "",
  completed: false,
  time: "",
});
const addTodoRules = {
  id: {
    required: true,
    type: "number",
    message: "请输入合法 ID",
    trigger: ["input", "blur"],
  },
  title: {
    required: true,
    message: "请输入标题",
    trigger: ["input", "blur"],
  },
};

// 右键菜单数据
const todoDropdownX = ref(0);
const todoDropdownY = ref(0);
const todoDropdownShow = ref(false);
const todoDropdownOptions = [
  {
    label: "编辑",
    key: "edit",
    icon: renderIcon("edit"),
  },
  {
    label: "删除",
    key: "delete",
    icon: renderIcon("delete-1"),
  },
];

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 关闭弹窗
const addTodoClose = () => {
  addTodoModalShow.value = false;
  addTodoValue.value = {
    id: null,
    title: "",
    desc: "",
    completed: false,
    time: "",
  };
};

// 开启添加待办
const addTodoModalOpen = () => {
  const todoMaxID = todoData.value.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, -1);
  addTodoValue.value = {
    id: todoMaxID + 1,
    title: "",
    desc: "",
    completed: false,
    time: getCurrentTime(),
  };
  addTodoModalType.value = false;
  addTodoModalShow.value = true;
};

// 添加或编辑待办
const addOrEditTodo = () => {
  addTodoRef.value?.validate((errors) => {
    if (errors) {
      $message.error("请检查您的输入");
      return false;
    }
    if (!addTodoModalType.value) {
      const isDuplicate = todoData.value?.some(
        (item) =>
          item.title === addTodoValue.value.title &&
          item.desc === addTodoValue.value.desc,
      );
      if (isDuplicate) {
        $message.error("已有相同标题和描述的待办");
        return false;
      }
      todoData.value.push({
        id: addTodoValue.value.id,
        title: addTodoValue.value.title,
        desc: addTodoValue.value.desc,
        completed: addTodoValue.value.completed,
        time: getCurrentTime(),
      });
      $message.success("待办添加成功");
      addTodoClose();
      return true;
    } else {
      const index = todoData.value.findIndex((item) => item.id === addTodoValue.value.id);
      if (index === -1) {
        $message.error("待办中不存在该项，请重试");
        return false;
      }
      todoData.value[index].title = addTodoValue.value.title;
      todoData.value[index].desc = addTodoValue.value.desc;
      todoData.value[index].completed = addTodoValue.value.completed;
      todoData.value[index].time = getCurrentTime();
      $message.success("待办编辑成功");
      addTodoClose();
      return true;
    }
  });
};

// 删除待办
const delTodo = () => {
  const deleteId = addTodoValue.value.id;
  if (typeof deleteId === "number") {
    const indexToRemove = todoData.value.findIndex((item) => item.id === deleteId);
    if (indexToRemove !== -1) {
      todoData.value.splice(indexToRemove, 1);
      for (let i = indexToRemove; i < todoData.value.length; i++) {
        todoData.value[i].id = i;
      }
      $message.success("待办删除成功");
      return true;
    }
    $message.error("待办删除失败，请重试");
  } else {
    $message.error("待办删除失败，请重试");
  }
};

// 切换待办完成状态（点击整行）
const toggleTodo = (item) => {
  item.completed = !item.completed;
  item.time = getCurrentTime();
};

// 设置待办状态（通过 checkbox）
const setTodoStatus = (item, val) => {
  item.completed = val;
  item.time = getCurrentTime();
};

// 开启右键菜单
const todoContextmenu = (e, data) => {
  e.preventDefault();
  todoDropdownShow.value = false;
  const { id, title, desc, completed, time } = data;
  addTodoValue.value = { id, title, desc, completed, time };
  nextTick().then(() => {
    todoDropdownShow.value = true;
    todoDropdownX.value = e.clientX;
    todoDropdownY.value = e.clientY;
  });
};

// 右键菜单点击
const todoDropdownSelect = (key) => {
  todoDropdownShow.value = false;
  switch (key) {
    case "edit":
      addTodoModalType.value = true;
      addTodoModalShow.value = true;
      break;
    case "delete":
      $dialog.warning({
        title: "删除待办",
        content: `确认删除 ${addTodoValue.value.title} 待办？此操作将无法恢复！`,
        positiveText: "删除",
        negativeText: "取消",
        onPositiveClick: () => {
          delTodo();
        },
      });
      break;
    default:
      break;
  }
};
</script>

<style lang="scss" scoped>
.todo-list__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .todo-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .all-todo {
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 10px;
      .todo-item {
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        padding: 14px 16px;
        background-color: var(--main-background-light-color);
        border-radius: 8px;
        transition:
          background-color 0.3s,
          box-shadow 0.3s;
        .n-checkbox {
          margin-right: 12px;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .todo-info {
          flex: 1;
          min-width: 0;
          .todo-title {
            font-size: 15px;
            font-weight: bold;
            color: var(--main-text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: opacity 0.3s;
          }
          .todo-desc {
            font-size: 13px;
            margin-top: 4px;
            color: var(--main-text-grey-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: opacity 0.3s;
          }
          .todo-time {
            font-size: 12px;
            margin-top: 6px;
            opacity: 0.7;
            color: var(--main-text-grey-color);
          }
        }
        &:hover {
          background-color: var(--main-background-hover-color);
          box-shadow: 0 0 0px 2px var(--main-background-hover-color);
        }
        &:active {
          box-shadow: none;
        }
        &.completed {
          .todo-title {
            text-decoration: line-through;
            opacity: 0.6;
          }
          .todo-desc {
            opacity: 0.5;
          }
        }
        &.add {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          min-height: 52px;
          .i-icon {
            width: 1rem;
            margin-right: 6px;
            font-size: 18px;
            opacity: 1;
          }
          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
  .not-todo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    .tip {
      font-size: 24px;
      margin-bottom: 20px;
      color: var(--main-text-color);
    }
  }
}
</style>
