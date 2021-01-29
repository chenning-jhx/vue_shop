<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../../assets/image/logo.png" />
        <span>小程序管理后台</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isFold">
        <div class="fold-btn" @click="handleFold">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          router
          unique-opened
          :default-active="activePath"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <el-submenu
            :index="item1.id.toString()"
            v-for="item1 in menusList"
            :key="item1.id"
          >
            <template slot="title">
              <i :class="iconsList[item1.id]"></i>
              <span>{{ item1.authName }}</span>
            </template>
            <el-menu-item
              :index="'/' + item2.path"
              v-for="item2 in item1.children"
              :key="item2.id"
              @click="handleActivePath('/' + item2.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ item2.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- router占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
    
<script>
export default {
  name: "Home",
  data() {
    return {
      menusList: [],
      iconsList: {
        125: "el-icon-user-solid",
        103: "el-icon-s-check",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-s-management",
      },
      isCollapse: false,
      activePath: "",
    };
  },
  computed: {
    isFold() {
      return this.isCollapse ? "60px" : "200px";
    },
  },
  created() {
    this.getMuensListData();
    this.activePath = sessionStorage.getItem("activePath");
  },
  methods: {
    //获取左侧菜单栏数据
    async getMuensListData() {
      const res = await this.$get("menus", {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取菜单列表失败");
      }
      this.menusList = res.data;
    },

    //监听退出按钮点击事件
    logout() {
      //跳转到登陆页面并情况缓存
      this.$router.replace("/login");
      localStorage.clear();
    },

    handleFold() {
      this.isCollapse = !this.isCollapse;
    },

    handleActivePath(activePath) {
      this.activePath = activePath;
      sessionStorage.setItem("activePath", this.activePath);
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    div {
      img {
        height: 60px;
      }
      span {
        margin-left: 10px;
        color: #fff;
        font-size: 25px;
        font-weight: 600;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .fold-btn {
      padding: 5px 0;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-align: center;
      color: #fff;
    }
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>