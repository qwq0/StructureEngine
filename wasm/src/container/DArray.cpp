/*
动态数组
*/

#pragma once

#include <cstdlib>
#include <cmath>

namespace se
{
    /*
        Auto-expanding array
        Automatically expand when the visit value is higher than the capacity
        If the expansion is at least expanded to (2<<log2(current capacity))
        自动扩容数组(动态数组)
        访问值高于容量时自动扩容
        如果扩容最少扩容到(2<<log2(当前容量))
    */
    template <class T>
    class DArray
    {
        unsigned int realSize;
        unsigned int useSize;
        T *a;

    public:
        /**
         * @brief 构造动态数组
         * 初始大小为2
         */
        DArray()
        {
            realSize = 2;
            a = (T *)malloc(realSize * sizeof(T));
        }

        /**
         * @brief 获取数组真实大小
         * 为2的整数幂
         */
        unsigned inline int getRealSize() { return realSize; }

        /**
         * @brief 获取数组大小
         * 已使用的大小
         */
        unsigned inline int size() { return useSize; }

        /**
         * @brief 删除操作
         * 释放内存
         */
        void inline clear() { free(a); }

        /**
         * @brief 扩容操作
         * @param i 扩容到大小
         */
        void inline expansion(unsigned int i)
        {
            if (i > realSize)
            {
                realSize = 2 << (int)(log2(realSize));
                a = (T *)realloc(a, realSize * sizeof(T));
            }
        }

        /**
         * @brief 访问操作
         */
        T &operator[](unsigned int i)
        {
            if (i >= realSize)
                expansion(i);
            else if (i >= useSize)
                useSize = i;
            else if (i < 0)
                throw "Invalid array position.";
            return a[i];
        }

        /**
         * @brief 在结尾加入元素
         */
        void push(T o)
        {
            (*this)[useSize] = o;
        }
    };
}