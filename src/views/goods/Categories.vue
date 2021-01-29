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
          <el-button type="primary">添加分类</el-button>
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
          <template slot="sort" slot-scope="scope"></template>
          <template slot="pro" slot-scope="scope"></template>
        </zk-table>
      </div>
    </el-card>
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
    },
  },
};
</script>

<style lang="less" scoped>
.cate-table {
  margin-top: 15px;
}
</style>