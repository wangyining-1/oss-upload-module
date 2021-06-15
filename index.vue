/* 附件上传OSS组件
   :moduleName 模块名称
   :fileKey 文件名key值（自定义父组件想要的字段名）
   :fileUrl 文件链接key值（自定义父组件想要的字段名）
   2021-6-9
 */
<template>
  <div class="uploadBox">
    <el-button size="small" type="primary" @click="showFileBtn">{{
      $t("safety.Click_upload")
    }}</el-button>

    <PreViewFile
      style="margin-top: 10px"
      :files="fileData"
      :mykey="fileUrl"
      :myname="fileKey"
    ></PreViewFile>

    <el-dialog
      :append-to-body="true"
      v-if="isShowDisable"
      :visible.sync="isShowDisable"
      width="40%"
      @close="closeDialog"
    >
      <el-upload
        class="upload-demo"
        ref="upload"
        action="action"
        :file-list="formAddFile.fileList"
        :auto-upload="false"
        :on-change="handleChange"
        multiple
        :on-remove="handleRemove"
        :before-upload="beforepload"
        :show-file-list="false"
      >
        <el-button slot="trigger" size="small" type="primary">{{
          this.$t("cloudDiskManagement.selectFile")
        }}</el-button>
        <el-button
          style="margin-left: 10px"
          size="small"
          type="success"
          @click="submitUpload"
          >{{ this.$t("cloudDiskManagement.confirmUpload") }}</el-button
        >
      </el-upload>
      <!-- 文件表格 -->
      <div>
        <el-table :data="formAddFile.fileList" style="width: 100%">
          <el-table-column prop="name" label="文件名" width="180">
          </el-table-column>
          <el-table-column prop="size" label="大小" width="180">
          </el-table-column>
          <el-table-column prop="percentage" label="进度">
            <template slot-scope="scope">
              <span>{{ scope.row.percentage + "%" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <button @click="delRow(scope.$index)" v-if="isDel">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { put,cancelApi } from "@/api/ossConfig/index";
import PreViewFile from "@/views/shared/components/PreViewFile";
export default {
  data() {
    //  showProgress: false, //进度条的显示
    //   progress: 0, //进度条数据,
    return {
      formAddFile: {
        fileList: [],
        fileUrl: "",
        fileName: "",
      },
      isDel: true,
      tempCheckpoint: "",
      uploadLog: [],
      point: null, //记录断点
      fileData: [],
      isShowDisable: false,
    };
  },
  beforeDestroy() {

  },
  mounted() {
    // let me = this;
  },
  components: {
    PreViewFile,
  },
  props: {
    moduleName: {
      type: String,
      default: "iwopFile",
    },
    fileKey: {
      type: String,
      default: "name",
    },
    fileUrl: {
      type: String,
      default: "url",
    },
  },
  methods: {
    closeDialog(){
    cancelApi();
    console.log("执行了");
    },
    delRow(index) {
      this.formAddFile.fileList.splice(index, 1);
    },
    showFileBtn() {
      this.isShowDisable = true;
      this.formAddFile = this.$options.data.call(this).formAddFile; //初始化formAddFile
      // this.formAddFile.fileList = this.fileData;
      this.isDel = true;
      this.tempCheckpoint = "";
      this.uploadLog = [];
      this.point = null; //记录断点
    },
    // 上传文件
    beforepload(newFile) {},
    // 删除
    handleRemove(index) {
      this.formAddFile.fileList.splice(index, 1);
    },
    // 改变钩子
    handleChange(file, fileList) {
      let me = this;
      me.formAddFile.fileName = file.name;
      me.formAddFile.fileUrl = file.raw;
      me.formAddFile.fileList = fileList;
      me.formAddFile.fileList.forEach((item) => {
        item.size = this.countSize(item.size);
        item.percentage = 0;
      });
      console.log(me.formAddFile.fileList);
    },
    // 计算文件大小
    countSize(size) {
      if (size < 1048576) {
        return Math.ceil(size / 1024) + "KB";
      } else if (size == 1048576) {
        return "1MB";
      } else if (size > 1048576 && size < 1073741824) {
        return (size / (1024 * 1024)).toFixed(2) + "MB";
      } else if (size > 1048576 && size == 1073741824) {
        return "1GB";
      } else if (size > 1073741824 && size < 1099511627776) {
        return Math.floor(size / (1024 * 1024 * 1024)) + "GB";
      } else {
        return size;
      }
    },
    // 提交上传
    submitUpload() {
      let me = this;
      me.isDel = false;
      var uploadSuccessList = []; //上传成功数组
      var uploadFailList = []; //上传失败数组
      var uploadLog = []; // 断点续传
      //   me.fileData = [];
      me.formAddFile.fileList.forEach((item, index) => {
        let fileName = item.name;
        let fileType = fileName.substring(fileName.lastIndexOf("."));
        let randomName = `${item.uid}${index}${fileType}`;
        put(
          randomName,
          item.raw,
          {
            progress: function (p, checkpoint) {
              item.percentage = Math.floor(p * 100);
            },
            // meta: { year: 2020, people: "test" },
            // mime: "image/jpg"
          },
          this.moduleName
        ).then((res) => {
          let url = `http://cccc-zhgd.oss-cn-beijing.aliyuncs.com/${res.name}`;
          let paramObj = {};
          paramObj[this.fileKey] = fileName;
          paramObj[this.fileUrl] = url;
          me.fileData.push(paramObj);
          this.$emit("input", me.fileData);
          this.$messgae.success("上传成功")
        });
      });
    },
  },
};
</script>

<style scoped>
</style>
