<template>
  <div class="user">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="7"
          ><el-input
            placeholder="请输入搜索内容"
            clearable
            v-model="queryInfo.query"
            @change="searchUser"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchUser"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="1"
          ><el-button type="primary" @click="handleAddUser"
            >添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="usersList" border stripe style="width: 100%">
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#409eff"
              inactive-color="#dcdfe6"
              @change="changeUserState(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="handleEditUser(scope.row)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteUser(scope.row)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-s-tools"
                @click="editUserRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 40, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="closeAddUser"
    >
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddUser">取 消</el-button>
        <el-button type="primary" @click="sureAddUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
    >
      <el-form
        :model="editUserForm"
        :rules="editUserRules"
        ref="editUserRef"
        label-width="100px"
        @close="cancelEditUser"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditUser">取 消</el-button>
        <el-button type="primary" @click="sureEditUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配用户角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="editRoledialogVisible"
      width="50%"
      @close="cancelEditRole"
    >
      <div class="role-dialog">用户名：{{ userInfo.username }}</div>
      <div class="role-dialog">当前用户角色：{{ userInfo.role_name }}</div>
      <div class="role-dialog">
        分配新角色：<el-select v-model="rid" clearable placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditRole">取 消</el-button>
        <el-button type="primary" @click="sureEditRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    //邮箱校验规则
    const checkEmail = (rule, value, callback) => {
      let emailRoule = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*.[a-z]{2,}$/;
      if (!emailRoule.test(value)) {
        callback(new Error("请输入正确的邮箱"));
      } else {
        callback();
      }
    };
    //手机号校验规则
    const checkMobile = (role, value, callback) => {
      let mobileRoule = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (!mobileRoule.test(value)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      usersList: [],
      total: 0,
      addUserDialogVisible: false,
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 6, message: "长度在 3 到 6 个字符", trigger: "blur" },
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
        email: [{ validator: checkEmail, trigger: "blur" }],
        mobile: [{ validator: checkMobile, trigger: "blur" }],
      },
      editUserDialogVisible: false,
      editUserForm: {},
      editUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 6, message: "长度在 3 到 6 个字符", trigger: "blur" },
        ],
        email: [{ validator: checkEmail, trigger: "blur" }],
        mobile: [{ validator: checkMobile, trigger: "blur" }],
      },
      editRoledialogVisible: false,
      userInfo: {},
      roleList: [],
      rid: "",
    };
  },
  created() {
    this.getUsersListData();
  },
  methods: {
    //发起请求，获取用户列表
    async getUsersListData() {
      const res = await this.$get("users", this.queryInfo, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.usersList = res.data.users;
      this.total = res.data.total;
    },

    //改变页面显示条数
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize;
      this.getUsersListData();
    },

    //改变页面页数
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum;
      this.getUsersListData();
    },

    //更改用户状态
    async changeUserState(userInfo) {
      const res = await this.$put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`,
        {},
        true
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("更新用户状态失败");
        userInfo.mg_state = !userInfo.mg_state;
      }
      this.$message.success("更新用户状态成功");
    },

    //显示添加用户对话框
    handleAddUser() {
      this.addUserDialogVisible = true;
    },

    //确定添加用户
    sureAddUser() {
      this.$refs.addUserRef.validate(async (vaild) => {
        //对表单校验
        if (!vaild) return;
        const res = await this.$post("users", this.addUserForm, true);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        this.addUserDialogVisible = false;
        this.$refs.addUserRef.resetFields();
        this.getUsersListData();
      });
    },

    // 取消添加用户
    cancelAddUser() {
      this.addUserDialogVisible = false;
      this.$refs.addUserRef.resetFields();
    },

    //关闭添加用户
    closeAddUser() {
      this.$refs.addUserRef.resetFields();
    },

    //显示编辑用户对话框
    async handleEditUser(userInfo) {
      const res = await this.$get(`users/${userInfo.id}`, {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户信息失败");
      }
      this.editUserForm = res.data;
      this.editUserDialogVisible = true;
    },

    //确定修改用户信息
    async sureEditUser() {
      const res = await this.$put(
        `users/${this.editUserForm.id}`,
        {
          id: this.editUserForm.id,
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile,
        },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新用户信息失败");
      }
      this.$message.success("更新用户信息成功");
      this.$refs.editUserRef.resetFields();
      this.editUserDialogVisible = false;
      this.getUsersListData();
    },

    //取消修改用户信息，关闭对话框
    cancelEditUser() {
      this.editUserDialogVisible = false;
    },

    //删除用户
    async deleteUser(userInfo) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除该用户");
      }
      const res = await this.$delete(`users/${userInfo.id}`, {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUsersListData();
    },

    //显示分配角色对话框
    async editUserRole(userInfo) {
      this.userInfo = userInfo;
      const res = await this.$get("roles", {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      this.editRoledialogVisible = true;
    },

    //确定分配角色
    async sureEditRole() {
      const res = await this.$put(
        `users/${this.userInfo.id}/role`,
        { rid: this.rid },
        true
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("分配用户角色失败");
      }
      this.$message.success("分配用户角色成功");
      this.editRoledialogVisible = false;
      this.rid = "";
      this.getUsersListData();
    },

    //取消分配角色，关闭对话框
    cancelEditRole() {
      this.editRoledialogVisible = false;
    },

    //搜索框功能
    searchUser() {
      this.getUsersListData();
    },
  },
};
</script>

<style lang="less" scoped>
.user {
  .el-breadcrumb {
    margin-bottom: 20px;
  }
  .el-row {
    margin-bottom: 20px;
  }
  .el-pagination {
    margin-top: 10px;
  }
  .role-dialog {
    font-size: 18px;
    padding: 10px;
  }
}
</style>