<template>
  <div class="login">
    <div class="login-content">
      <div class="user-image">
        <img src="../../assets/image/touxiang.png" />
      </div>
      <el-form :model="loginForm" :rules="loginFormrules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="el-icon-s-goods"
          ></el-input>
        </el-form-item>
        <el-form-item class="login-btn">
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button type="danger" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginFormrules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 10,
            message: "长度在 6 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    //点击登陆
    handleLogin() {
      this.$refs.loginFormRef.validate(async (vaild) => {
        if (!vaild) return;
        const res = await this.$post("login", this.loginForm, false);
        if (res.meta.status !== 200) {
          return this.$message.error("登陆失败！");
        }
        const token = res.data.token;
        localStorage.setItem("token", token);

        //跳转首页
        this.$router.push("/home");
      });
    },

    //重置表单
    handleReset() {
      this.$refs.loginFormRef.resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
.login {
  position: relative;
  height: 100%;
  background: url("../../assets/image/login.jpg");
  .login-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 300px;
    background-color: #fff;
    .user-image {
      width: 180px;
      height: 180px;
      position: relative;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px;
      border: 1px solid #fff;
      border-radius: 50%;
      background-color: #fff;
      img {
        width: 100%;
        border: 1px solid #fff;
        border-radius: 50%;
      }
    }
    .el-form {
      position: absolute;
      left: 0;
      bottom: 0px;
      width: 100%;
      padding: 0 10px;
      .login-btn {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>