<template>
  <div class="params">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告文案 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        :closable="false"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 商品分类选择器 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="checkKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs选择区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button type="primary" :disabled="isDisabled" @click="addParam"
                >添加{{ showParam }}</el-button
              >
            </el-col>
          </el-row>
          <!-- 表格区域 -->
          <el-table :data="manyTableData" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="(tag, index) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleTagClose(index, scope.row)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  class="input-new-tag"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加新属性</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" :label="showParam + '名称'">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button type="primary" :disabled="isDisabled" @click="addParam"
                >添加{{ showParam }}</el-button
              >
            </el-col>
          </el-row>
          <!-- 表格区域 -->
          <el-table :data="onlyTableData" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="(tag, index) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleTagClose(index, scope.row)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  class="input-new-tag"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加新属性</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" :label="showParam + '名称'">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + showParam"
      :visible.sync="addParamDialogVisible"
      width="50%"
      @close="cancelAddParam"
    >
      <el-form
        :model="addParamForm"
        :rules="addParamRule"
        ref="addParamRef"
        label-width="100px"
      >
        <el-form-item :label="showParam + '名称'" prop="attr_name">
          <el-input v-model="addParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddParam">取 消</el-button>
        <el-button type="primary" @click="sureAddParam">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + showParam"
      :visible.sync="editParamDialogVisible"
      width="50%"
    >
      <el-form
        :model="editParamForm"
        :rules="addParamRule"
        ref="editParamRef"
        label-width="100px"
      >
        <el-form-item :label="showParam + '名称'" prop="attr_name">
          <el-input v-model="editParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditParam">取 消</el-button>
        <el-button type="primary" @click="sureEditParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      cateList: [],
      checkKeys: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      manyTableData: [],
      onlyTableData: [],
      activeName: "many",
      addParamDialogVisible: false,
      addParamForm: {
        attr_name: "",
      },
      addParamRule: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
          {
            min: 1,
            max: 10,
            message: "长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      editParamDialogVisible: false,
      editParamForm: {
        attr_name: "",
      },
      paramInfo: {},
    };
  },
  created() {
    this.getCateListData();
  },
  computed: {
    //计算分类选择的id
    selectId() {
      //因为只有3级分类
      return this.checkKeys[2];
    },

    //添加按钮是否禁用
    isDisabled() {
      return this.checkKeys.length === 3 ? false : true;
    },

    //显示参数/属性
    showParam() {
      return this.activeName === "many" ? "参数" : "属性";
    },
  },
  methods: {
    //获取商品分类数据
    async getCateListData() {
      const res = await this.$get("categories", {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data;
    },

    //监听商品选择器变化
    handleChange() {
      this.getCateParamsData();
    },

    //监听tab点击，请求数据
    handleTabClick() {
      this.getCateParamsData();
    },

    //获取动态参数 静态属性列表
    async getCateParamsData() {
      //判断是否选择的3级分类
      let length = this.checkKeys.length;
      if (length !== 3) {
        this.checkKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return this.$message.error("请选择3级分类");
      }

      //请求参数
      const res = await this.$get(
        `categories/${this.selectId}/attributes`,
        { sel: this.activeName },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }
      // attr_vals字符串变成数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });

      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    //保存修改参数
    async saveParamTag(paramInfo) {
      const res = await this.$put(
        `categories/${this.selectId}/attributes/${paramInfo.attr_id}`,
        {
          attr_name: paramInfo.attr_name,
          attr_sel: paramInfo.attr_sel,
          attr_vals: paramInfo.attr_vals.join(","),
        },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改" + this.showParam + "失败");
      }
    },

    //删除参数tag
    handleTagClose(index, paramInfo) {
      paramInfo.attr_vals.splice(index, 1);
      this.saveParamTag(paramInfo);
    },

    //显示增加tag输入框
    showInput(paramInfo) {
      paramInfo.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    //回车 失去焦点增加新tag
    handleInputConfirm(paramInfo) {
      //判断输入框中是否有值
      if (paramInfo.inputValue.length === 0) {
        paramInfo.inputValue = "";
        paramInfo.inputVisible = false;
        return;
      }

      //如果有值，去除空格，发起请求
      paramInfo.attr_vals.push(paramInfo.inputValue.trim());
      paramInfo.inputValue = "";
      paramInfo.inputVisible = false;
      this.saveParamTag(paramInfo);
    },

    //显示添加参数/属性对话框
    addParam() {
      this.addParamDialogVisible = true;
      console.log(this.activeName);
    },

    //确定添加参数/属性
    async sureAddParam() {
      const res = await this.$post(
        `categories/${this.selectId}/attributes`,
        { attr_name: this.addParamForm.attr_name, attr_sel: this.activeName },
        true
      );
      if (res.meta.status !== 201) {
        return this.$message.error("添加" + this.showParam + "失败");
      }
      this.$message.success("添加" + this.showParam + "成功");
      this.$refs.addParamRef.resetFields();
      this.addParamDialogVisible = false;
      this.getCateParamsData();
    },

    //取消添加参数/属性
    cancelAddParam() {
      this.addParamDialogVisible = false;
      this.$refs.addParamRef.resetFields();
    },

    //显示编辑参数对话框
    async showEditParamDialog(paramInfo) {
      this.paramInfo = paramInfo;
      const res = await this.$get(
        `categories/${this.selectId}/attributes/${paramInfo.attr_id}`,
        { attr_sel: paramInfo.attr_sel },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数数据失败");
      }
      this.editParamForm.attr_name = res.data.attr_name;
      this.editParamDialogVisible = true;
    },

    //确定修改参数
    sureEditParam() {
      this.$refs.editParamRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.$put(
          `categories/${this.selectId}/attributes/${this.paramInfo.attr_id}`,
          {
            attr_name: this.editParamForm.attr_name,
            attr_sel: this.paramInfo.attr_sel,
          },
          true
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改" + this.showParam + "失败");
        }
        this.$message.success("添加" + this.showParam + "成功");
        this.editParamDialogVisible = false;
        this.getCateParamsData();
      });
    },

    //取消 关闭修改参数
    cancelEditParam() {
      this.editParamDialogVisible = false;
    },

    //删除参数
    async deleteParam(paramInfo) {
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
        return this.$message.info("已取消删除参数");
      }
      const res = await this.$delete(
        `categories/${this.selectId}/attributes/${paramInfo.attr_id}`,
        {},
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败");
      }
      this.$message.success("删除参数成功");
      this.getCateParamsData();
    },
  },
};
</script>

<style lang="less" scoped>
.el-row,
.el-tabs {
  margin-top: 15px;
}

.el-tag,
.button-new-tag {
  margin: 5px;
}

.input-new-tag {
  width: 120px;
  margin: 10px;
}
</style>