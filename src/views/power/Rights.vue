<template>
  <div class="rights">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <template>
        <el-table :data="rightsList" border stripe style="width: 100%"
          ><el-table-column type="index" label="#"> </el-table-column>
          <el-table-column prop="authName" label="权限名称"> </el-table-column>
          <el-table-column prop="path" label="路径"> </el-table-column>
          <el-table-column prop="level" label="权限等级"
            ><template slot-scope="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag
              ><el-tag type="success" v-else-if="scope.row.level === '1'"
                >二级</el-tag
              ><el-tag type="info" v-else>三级</el-tag></template
            ></el-table-column
          >
        </el-table>
      </template></el-card
    >
  </div>
</template>
    </el-card>
  </div>
</template>
<script>
export default {
  name: "Rights",
  data() {
    return {
      rightsList: [],
    };
  },
  created() {
    this.getRightsListData();
  },
  methods: {
    //获取权限列表数据
    async getRightsListData() {
      const res = await this.$get("rights/list", {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightsList = res.data;
    },
  },
};
</script>

<style lang="less" scoped>
</style>