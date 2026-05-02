<template>
  <footer id="footer" @click.stop>
    <div class="copyright">
      <span class="site-name">{{ siteName }}</span>
      <span class="year">{{ fullYear }}</span>
      <span class="anthor" @click="jumpTo(copyrightLink ?? 'https://github.com/imsyy/Snavigation')">
        {{ siteAnthor }}
      </span>
    </div>
  </footer>
</template>

<script setup>
import { setStore } from "@/stores";

const set = setStore();

// 站点数据
const siteName = import.meta.env.VITE_SITE_TITLE;
const siteAnthor = import.meta.env.VITE_SITE_ANTHOR;
const copyrightLink = import.meta.env.VITE_SITE_COPYRIGHTLINK;
const fullYear = new Date().getFullYear();

// 跳转
const jumpTo = (url) => {
  if (set.urlJumpType === "href") {
    window.location.href = url;
  } else if (set.urlJumpType === "open") {
    window.open(url, "_blank");
  }
};
</script>

<style lang="scss" scoped>
#footer {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  height: 50px;
  width: 100%;
  color: var(--main-text-color);
  z-index: 1;
  .copyright {
    display: flex;
    align-items: center;
    font-size: 13px;
    span {
      margin: 0 2px;
      opacity: 0.6;
      transition: opacity 0.3s;
      &::before {
        opacity: 0.6;
        transition: none;
      }
    }
    .year {
      &::before {
        content: "@";
        opacity: 1;
        margin-right: 4px;
      }
    }
    .anthor {
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
