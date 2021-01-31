<template>
  <div class="add-goods">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 消息提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :active="parseInt(activeName)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tabs标签页 -->
      <el-form
        :model="addGoodForm"
        :rules="addGoodRules"
        ref="addGoodRef"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeName"
          :before-leave="tabsChange"
          @tab-click="toParamPage"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                type="number"
                v-model="addGoodForm.goods_price"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                type="number"
                v-model="addGoodForm.goods_weight"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                type="number"
                v-model="addGoodForm.goods_number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleCateChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(val, index) in item.attr_vals"
                  :key="index"
                  :label="val"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :headers="headerObj"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodForm.goods_introduce"> </quill-editor>
            <el-button type="primary" class="add-button" @click="addGood"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewUrl" alt="" class="preViewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "AddGoods",
  data() {
    return {
      activeName: "",
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      addGoodForm: {
        goods_name: "",
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: "",
        pics: [],
        attrs: [],
      },
      addGoodRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      manyTableData: [],
      onlyTableData: [],
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      disabled: false,
      headerObj: {
        Authorization: localStorage.getItem("token"),
      },
      previewDialogVisible: false,
      previewUrl: "",
      isShow: true,
    };
  },
  created() {
    this.getCateListData();
  },
  computed: {
    //分类选择器选择的id
    selectId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2];
      }
    },
  },
  methods: {
    //获取商品分类数据
    async getCateListData() {
      const res = await this.$get("categories", {}, true);
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
    },

    //监听分类选择器改变
    handleCateChange() {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = [];
        this.$message.error("请选择3级分类");
      }
    },
    //监听tabs更换tab
    tabsChange(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error("请选择3级分类");
        return false;
      }
    },

    //跳转到商品参数/属性页面
    async toParamPage() {
      //获取参数数据
      if (this.activeName === "1") {
        const res = await this.$get(
          `categories/${this.selectId}/attributes`,
          { sel: "many" },
          true
        );
        if (res.meta.status !== 200) {
          return this.$message.error("请求动态参数数据失败");
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      } else if (this.activeName === "2") {
        const res = await this.$get(
          `categories/${this.selectId}/attributes`,
          { sel: "only" },
          true
        );
        if (res.meta.status !== 200) {
          return this.$message.error("请求静态属性数据失败");
        }
        this.onlyTableData = res.data;
      }
    },

    //图片上传成功的回调函数，获取到图片地址
    uploadSuccess(response) {
      const pic = {
        pic: response.data.tmp_path,
      };
      this.addGoodForm.pics.push(pic);
    },

    //图片预览,获取到上传回调函数中的url
    handlePictureCardPreview(file) {
      this.previewUrl = file.response.data.url;
      this.previewDialogVisible = true;
    },

    //移出图片
    handleRemove(file) {
      const path = file.response.data.tmp_path;
      const index = this.addGoodForm.pics.findIndex(
        (item) => item.pic === path
      );
      this.addGoodForm.pics.splice(index, 1);
    },

    //添加商品
    addGood() {
      this.$refs.addGoodRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写所有必填项");
        }

        //使用lodash深克隆出一个新对象
        const newForm = _.cloneDeep(this.addGoodForm);

        //将goods_cat数组转变成字符串
        newForm.goods_cat = newForm.goods_cat.join(",");

        this.manyTableData.forEach((item) => {
          const value = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(","),
          };
          newForm.attrs.push(value);
        });

        this.onlyTableData.forEach((item) => {
          const value = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          newForm.attrs.push(value);
        });

        //发起网络请求
        const res = await this.$post("goods", newForm, true);
        if (res.meta.status !== 201) {
          this.$message.error("添加商品失败");
        }
        this.$message.success("添加商品成功");
        this.$router.replace("/goods");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}

.el-checkbox {
  margin: 0 10px;
}

.preViewImg {
  width: 100%;
}

.add-button {
  display: block;
  margin: 80px auto 0;
}

.quill-editor {
  height: 300px;
}
</style>