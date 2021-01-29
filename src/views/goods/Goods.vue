<template>
  <div class="goos">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入搜索内容"
            clearable
            v-model="params.query"
            @change="searchGoods"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchGoods"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="handleAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50px"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="150px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px">
        </el-table-column>
        <el-table-column label="创建时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoods(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Goods",
  data() {
    return {
      params: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
    };
  },
  created() {
    this.getGoodsListData();
  },
  methods: {
    //获取商品列表
    async getGoodsListData() {
      const res = await this.$get("goods", this.params, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },

    //分页，根据每页显示条数改变
    handleSizeChange(newPagesize) {
      this.params.pagesize = newPagesize;
      this.getGoodsListData();
    },

    //分页，根据页数显示改变
    handleCurrentChange(newPagenum) {
      this.params.pagenum = newPagenum;
      this.getGoodsListData();
    },

    //搜索框功能
    searchGoods() {
      this.getGoodsListData();
    },

    //添加商品
    handleAddGoods() {
      this.$router.push("/addgoods");
    },

    //删除商品
    async deleteGoods(goodsInfo) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        this.$message.info("已取消删除商品");
      }
      const res = await this.$delete(
        `goods/${goodsInfo.goods_id}`,
        { id: goodsInfo.goods_id },
        true
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败");
      }
      this.$message.success("删除商品成功");
      this.getGoodsListData();
    },
  },
};
</script>

<style lang="less" scoped>
</style>