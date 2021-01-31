<template>
  <div class="categories">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="2">
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类数据表格区域 -->
      <div class="cate-table">
        <zk-table
          ref="catesRef"
          :data="catesList"
          :columns="columns"
          stripe
          border
          :show-index="true"
          :selection-type="false"
          :expand-type="false"
          index-text="#"
        >
          <template slot="isOK" slot-scope="scope">
            <i
              class="el-icon-success"
              v-if="!scope.row.cat_deleted"
              style="color: blue"
            ></i>
            <i class="el-icon-error" v-else style="color: red"></i>
          </template>
          <template slot="sort" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="info" v-else>三级</el-tag>
          </template>
          <template slot="pro" slot-scope="scope">
            <el-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              @click="editCate(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              icon="el-icon-delete"
              @click="deleteCate(scope.row)"
              >删除</el-button
            >
          </template>
        </zk-table>
      </div>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
        @close="cancelAddCate"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="parentKeys"
            :options="parentCateList"
            :props="parentCateProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddCate">取 消</el-button>
        <el-button type="primary" @click="sureAddCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="addCateRules"
        ref="editCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditCate">取 消</el-button>
        <el-button type="primary" @click="sureEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Categories",
  data() {
    return {
      params: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      catesList: [],
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOK",
        },
        {
          label: "排序",
          type: "template",
          template: "sort",
        },
        {
          label: "操作",
          type: "template",
          template: "pro",
        },
      ],
      total: 0,
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      parentCateList: [],
      parentCateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      parentKeys: [],
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: "",
      },
      cat_id: 0,
    };
  },
  created() {
    this.getCatesListData();
  },
  methods: {
    //获取分类数据
    async getCatesListData() {
      const res = await this.$get("categories", this.params, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类数据失败");
      }
      this.catesList = res.data.result;
      this.total = res.data.total;
    },

    //更改页面size刷新数据
    handleSizeChange(newPagesize) {
      this.params.pagesize = newPagesize;
      this.getCatesListData();
    },

    //改变页数刷新数据
    handleCurrentChange(newPagenum) {
      this.params.pagenum = newPagenum;
      this.getCatesListData();
    },

    //显示添加分类对话框
    async addCate() {
      //请求父级分类列表数据
      const res = await this.$get("categories", { type: 2 }, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表数据失败");
      }
      this.parentCateList = res.data;
      this.addCateDialogVisible = true;
    },

    //监听父级分类列表变化事件
    parentCateChange() {
      let length = this.parentKeys.length;
      //如果长度大于0，选择了分类
      if (length > 0) {
        this.addCateForm.cat_pid = this.parentKeys[length - 1];
        this.addCateForm.cat_level = length;
      } else {
        //如果长度等于0，没有选择分类，父级id为0，一级菜单
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    //确定添加分类
    sureAddCate() {
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.$post("categories", this.addCateForm, true);
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.addCateDialogVisible = false;
        this.$refs.addCateRef.resetFields();
        this.parentKeys = [];
        this.getCatesListData();
      });
    },

    //取消 关闭添加分类对话框
    cancelAddCate() {
      this.addCateDialogVisible = false;
      this.$refs.addCateRef.resetFields();
      this.parentKeys = [];
    },

    //显示修改分类对话框
    async editCate(cateInfo) {
      this.cat_id = cateInfo.cat_id;
      const res = await this.$get(`categories/${this.cat_id}`, {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类名称失败");
      }
      this.editCateForm.cat_name = res.data.cat_name;
      this.editCateDialogVisible = true;
    },

    //确定修改分类名称
    sureEditCate() {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.$put(
          `categories/${this.cat_id}`,
          this.editCateForm,
          true
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改分类失败");
        }
        this.$message.success("修改分类成功");
        this.editCateDialogVisible = false;
        this.getCatesListData();
      });
    },

    //取消修改分类名称
    cancelEditCate() {
      this.editCateDialogVisible = false;
    },

    //删除分类
    async deleteCate(cateInfo) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除分类");
      }
      const res = await this.$delete(`categories/${cateInfo.cat_id}`, {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败");
      }
      this.$message.success("删除分类成功");
      this.getCatesListData();
    },
  },
};
</script>

<style lang="less" scoped>
.cate-table {
  margin: 15px 0;
}
</style>