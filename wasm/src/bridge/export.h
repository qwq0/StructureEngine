/*
有关函数导出的宏
*/

#pragma once
#include <cstdlib>

/*
保留函数
防止被编译器删除
*/
#define alive __attribute__((used))

/*
使用C语言函数命名
不对函数进行重命名
*/
#define extc extern "C"
