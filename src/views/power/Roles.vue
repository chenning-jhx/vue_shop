<template>
  <div class="roles">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="addRole">添加用户</el-button>
        </el-col>
      </el-row>
      <template>
        <el-table :data="rolesList" border stripe style="width: 100%">
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row
                v-for="(item1, index1) in scope.row.children"
                :key="item1.id"
                :class="[
                  'border-bottom',
                  index1 === 0 ? 'border-top' : '',
                  'item-align',
                ]"
              >
                <el-col :span="5">
                  <el-tag closable @close="deleteRights(scope.row, item1.id)">
                    {{ item1.authName }}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row
                    v-for="(item2, index2) in item1.children"
                    :key="item2.id"
                    :class="index2 === 0 ? '' : 'border-top'"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="deleteRights(scope.row, item2.id)"
                        >{{ item2.authName }}</el-tag
                      >
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        type="info"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        closable
                        @close="deleteRights(scope.row, item3.id)"
                        >{{ item3.authName }}</el-tag
                      >
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"> </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="editRole(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="deleteRole(scope.row)"
                >删除</el-button
              >
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-s-tools"
                @click="AssignRole(scope.row)"
                >分配权限</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </template></el-card
    >
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="closeaddRoleDialog"
    >
      <el-form
        :model="addRoleForm"
        :rules="addRoleRules"
        ref="addRoleRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddRole">取 消</el-button>
        <el-button type="primary" @click="sureAddRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
    >
      <el-form
        :model="editRoleForm"
        :rules="addRoleRules"
        ref="editRoleRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditRole">取 消</el-button>
        <el-button type="primary" @click="sureEditRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignRoleDialogVisible"
      width="50%"
      @close="closeAssignRole"
    >
      <el-tree
        :data="roleRightList"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="deaultChKeys"
        :props="roleRightProps"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAssignRole">取 消</el-button>
        <el-button type="primary" @click="sureAssignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      addRoleRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 6, message: "长度在 3 到 6 个字符", trigger: "blur" },
        ],
      },
      editRoleDialogVisible: false,
      editRoleForm: {},
      assignRoleDialogVisible: false,
      roleRightList: [],
      deaultChKeys: [],
      roleRightProps: {
        children: "children",
        label: "authName",
      },
      roleId: 0,
    };
  },
  created() {
    this.getRolesListData();
  },
  methods: {
    //获取角色列表数据
    async getRolesListData() {
      const res = await this.$get("roles", {}, true);
      if (res.meta.status !== 200) {
        return this.$message("获取用户列表失败");
      }
      this.rolesList = res.data;
    },

    //删除角色权限
    async deleteRights(role, id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        this.$message.info("取消删除角色权限");
      }
      const res = await this.$delete(
        `roles/${role.id}/rights/${id}`,
        { roleId: role.id, rightId: id },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色权限失败");
      }
      this.$message.success("删除角色权限成功");
      role.children = res.data;
    },

    //显示添加角色对话框
    addRole() {
      this.addRoleDialogVisible = true;
    },

    //确定添加角色
    async sureAddRole() {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.$post("roles", this.addRoleForm, true);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");
        this.addRoleDialogVisible = false;
        this.$refs.addRoleRef.resetFields();
        this.getRolesListData();
      });
    },

    //取消添加角色
    cancelAddRole() {
      this.addRoleDialogVisible = false;
      this.$refs.addRoleRef.resetFields();
    },

    //关闭添加角色对话框
    closeaddRoleDialog() {
      this.$refs.addRoleRef.resetFields();
    },

    //显示编辑角色对话框
    async editRole(roleInfo) {
      const res = await this.$get(
        `roles/${roleInfo.id}`,
        { id: roleInfo.id },
        true
      );
      this.editRoleForm = res.data;
      console.log(this.editRoleForm);
      this.editRoleDialogVisible = true;
    },

    //确定修改角色
    sureEditRole() {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.$put(
          `roles/${this.editRoleForm.roleId}`,
          {
            id: this.editRoleForm.roleId,
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          },
          true
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色失败");
        }
        this.$message.success("修改角色成功");
        this.editRoleDialogVisible = false;
        this.getRolesListData();
      });
    },

    //取消修改角色
    cancelEditRole() {
      this.editRoleDialogVisible = false;
    },

    //删除角色
    async deleteRole(roleInfo) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const res = await this.$delete(
        `roles/${roleInfo.id}`,
        { id: roleInfo.id },
        true
      );
      if (res.meta.status !== 200) {
        this.$message.error("删除角色失败");
      }
      this.$message.success("删除角色成功");
      this.getRolesListData();
    },

    //显示分配权限对话框
    async AssignRole(roleInfo) {
      this.roleId = roleInfo.id;
      const res = await this.$get("rights/tree", {}, true);
      this.roleRightList = res.data;
      //递归求得已选择的3级权限的id
      this.getDefaultKeys(roleInfo, this.deaultChKeys);
      this.assignRoleDialogVisible = true;
    },

    //递归求得3级权限的id
    getDefaultKeys(role, arr) {
      //如果没有children属性，为3级权限，取出id
      if (!role.children) {
        return arr.push(role.id);
      }
      role.children.forEach((item) => this.getDefaultKeys(item, arr));
    },

    //确定分配权限
    async sureAssignRole() {
      const chkKeys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const res = await this.$post(
        `roles/${this.roleId}/rights`,
        { roleId: this.roleId, rids: chkKeys.join(",") },
        true
      );
      if (!res) {
        return this.$message.error("更新权限失败");
      }
      this.$message.success("更新权限成功");
      this.getRolesListData();
      this.deaultChKeys = [];
      this.assignRoleDialogVisible = false;
    },

    //取消分配权限
    cancelAssignRole() {
      this.deaultChKeys = [];
      this.assignRoleDialogVisible = false;
    },

    //关闭分配权限对话框
    closeAssignRole() {
      this.deaultChKeys = [];
    },
  },
};
</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 10px;
}

.el-tag {
  margin: 5px;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}

.border-top {
  border-top: 1px solid #eee;
}

.item-align {
  display: flex;
  align-items: center;
}
</style>