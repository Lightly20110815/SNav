<template>
  <!-- 全局配置组件 -->
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="currentNaiveTheme"
    :theme-overrides="themeOverrides"
    abstract
    inline-theme-disabled
  >
    <n-dialog-provider>
      <n-notification-provider>
        <n-message-provider :max="1">
          <slot />
          <NaiveProviderContent />
        </n-message-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import { defineComponent, h, computed, onMounted, onBeforeUnmount, ref } from "vue";
import {
  zhCN,
  dateZhCN,
  darkTheme,
  lightTheme,
  NConfigProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  useDialog,
  useNotification,
  useMessage,
} from "naive-ui";
import { setStore } from "@/stores";

const set = setStore();

// 系统主题媒体查询
const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const systemIsDark = ref(systemDarkQuery.matches);

// 获取 naive-ui 实际主题
const currentNaiveTheme = computed(() => {
  if (set.themeType === "auto") {
    return systemIsDark.value ? darkTheme : lightTheme;
  }
  return set.themeType === "light" ? lightTheme : darkTheme;
});

// 监听系统主题变化
const handleSystemThemeChange = (e) => {
  systemIsDark.value = e.matches;
};

onMounted(() => {
  systemDarkQuery.addEventListener("change", handleSystemThemeChange);
});

onBeforeUnmount(() => {
  systemDarkQuery.removeEventListener("change", handleSystemThemeChange);
});

// 全局主题
const themeOverrides = {
  common: {
    fontFamily: "'HarmonyOS_Regular', sans-serif",
    primaryColor: "#ffffff",
    primaryColorHover: "#ffffff70",
    primaryColorSuppl: "#ffffff30",
    primaryColorPressed: "#ffffff30",
  },
};

// 挂载 Naive 组件
const setupNaiveTools = () => {
  // 通知
  window.$notification = useNotification();
  // 信息
  window.$message = useMessage();
  // 对话框
  window.$dialog = useDialog();
};

// Naive 功能组件
const NaiveProviderContent = defineComponent({
  setup() {
    setupNaiveTools();
  },
  render() {
    return h("div", { className: "main-tools" });
  },
});
</script>
