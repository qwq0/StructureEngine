/*
wasm场景管理实现
*/

#include "./bridge/export.h"
#include "./container/DArray.cpp"

char version_info[] = // 版本信息
    "StructureEngine scenario manages WASM modules\n"
    "version: "
    "Alpha 1.0" // 版本号
    "\n"
    "Compile time: " __DATE__ " - " __TIME__; // 编译时间
se::DArray<int> alive objectList;
// 导出给js的api
extc
{
    // 返回当前版本信息
    char *alive info()
    {
        return version_info;
    }
    // 请求内存
    char *alive requestMemory(int size)
    {
        return (char *)malloc(size_t(size));
    }
    // 请求内存
    void *alive freeMemory(char *p)
    {
        free(p);
    }
    // 添加物体
    void alive addObject(int o)
    {
        objectList.push(o);
    }
    int alive removeObjects()
    {
    }
}
// 主函数(初始化)
int main()
{
    return 0;
}