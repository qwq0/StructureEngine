/*
多叉树
*/

#pragma once

#include "./DArray.cpp"

namespace se
{
    /*
    多叉树节点类
    */
    template <class T>
    class treeNode
    {
        // 当前节点值
        T v;

        // 子节点
        DArray<treeNode<T> *> s;

        void addChild(treeNode<T> *o)
        {
            s.push(o);
        }
    };
}