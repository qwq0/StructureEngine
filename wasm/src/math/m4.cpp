/*
4*4矩阵
*/

#pragma once

#include "./math.cpp"

namespace se
{
    // 4*4矩阵类
    class m4
    {
        // 矩阵数据
        int a[16];

        m4()
        {
            for (int i = 0; i < 16; i++)
                a[i] = 0;
            for (int i = 0; i < 4; i++) // 对角线初始为1
                a[i * 5] = 1;
        }

        m4(int *m)
        {
            for (int i = 0; i < 16; i++)
                a[i] = m[i];
        }

        m4(m4 *m)
        {
            for (int i = 0; i < 16; i++)
                a[i] = m->a[i];
        }

        /**
         * 矩阵乘法
         * 不会改变原矩阵
         * 注意 此乘法与一般矩阵乘法的ab相反
         * 此函数为b*a 也就是矩阵变换乘
         * c[i][j] = sum(a[k][j] + b[i][k])
         */
        m4 multiply(m4 matrix)
        {
            int *b = matrix.a;
            int r[16] = {(a[0 * 4 + 0] * b[0 * 4 + 0]) + (a[1 * 4 + 0] * b[0 * 4 + 1]) + (a[2 * 4 + 0] * b[0 * 4 + 2]) + (a[3 * 4 + 0] * b[0 * 4 + 3]),
                         (a[0 * 4 + 1] * b[0 * 4 + 0]) + (a[1 * 4 + 1] * b[0 * 4 + 1]) + (a[2 * 4 + 1] * b[0 * 4 + 2]) + (a[3 * 4 + 1] * b[0 * 4 + 3]),
                         (a[0 * 4 + 2] * b[0 * 4 + 0]) + (a[1 * 4 + 2] * b[0 * 4 + 1]) + (a[2 * 4 + 2] * b[0 * 4 + 2]) + (a[3 * 4 + 2] * b[0 * 4 + 3]),
                         (a[0 * 4 + 3] * b[0 * 4 + 0]) + (a[1 * 4 + 3] * b[0 * 4 + 1]) + (a[2 * 4 + 3] * b[0 * 4 + 2]) + (a[3 * 4 + 3] * b[0 * 4 + 3]),

                         (a[0 * 4 + 0] * b[1 * 4 + 0]) + (a[1 * 4 + 0] * b[1 * 4 + 1]) + (a[2 * 4 + 0] * b[1 * 4 + 2]) + (a[3 * 4 + 0] * b[1 * 4 + 3]),
                         (a[0 * 4 + 1] * b[1 * 4 + 0]) + (a[1 * 4 + 1] * b[1 * 4 + 1]) + (a[2 * 4 + 1] * b[1 * 4 + 2]) + (a[3 * 4 + 1] * b[1 * 4 + 3]),
                         (a[0 * 4 + 2] * b[1 * 4 + 0]) + (a[1 * 4 + 2] * b[1 * 4 + 1]) + (a[2 * 4 + 2] * b[1 * 4 + 2]) + (a[3 * 4 + 2] * b[1 * 4 + 3]),
                         (a[0 * 4 + 3] * b[1 * 4 + 0]) + (a[1 * 4 + 3] * b[1 * 4 + 1]) + (a[2 * 4 + 3] * b[1 * 4 + 2]) + (a[3 * 4 + 3] * b[1 * 4 + 3]),

                         (a[0 * 4 + 0] * b[2 * 4 + 0]) + (a[1 * 4 + 0] * b[2 * 4 + 1]) + (a[2 * 4 + 0] * b[2 * 4 + 2]) + (a[3 * 4 + 0] * b[2 * 4 + 3]),
                         (a[0 * 4 + 1] * b[2 * 4 + 0]) + (a[1 * 4 + 1] * b[2 * 4 + 1]) + (a[2 * 4 + 1] * b[2 * 4 + 2]) + (a[3 * 4 + 1] * b[2 * 4 + 3]),
                         (a[0 * 4 + 2] * b[2 * 4 + 0]) + (a[1 * 4 + 2] * b[2 * 4 + 1]) + (a[2 * 4 + 2] * b[2 * 4 + 2]) + (a[3 * 4 + 2] * b[2 * 4 + 3]),
                         (a[0 * 4 + 3] * b[2 * 4 + 0]) + (a[1 * 4 + 3] * b[2 * 4 + 1]) + (a[2 * 4 + 3] * b[2 * 4 + 2]) + (a[3 * 4 + 3] * b[2 * 4 + 3]),

                         (a[0 * 4 + 0] * b[3 * 4 + 0]) + (a[1 * 4 + 0] * b[3 * 4 + 1]) + (a[2 * 4 + 0] * b[3 * 4 + 2]) + (a[3 * 4 + 0] * b[3 * 4 + 3]),
                         (a[0 * 4 + 1] * b[3 * 4 + 0]) + (a[1 * 4 + 1] * b[3 * 4 + 1]) + (a[2 * 4 + 1] * b[3 * 4 + 2]) + (a[3 * 4 + 1] * b[3 * 4 + 3]),
                         (a[0 * 4 + 2] * b[3 * 4 + 0]) + (a[1 * 4 + 2] * b[3 * 4 + 1]) + (a[2 * 4 + 2] * b[3 * 4 + 2]) + (a[3 * 4 + 2] * b[3 * 4 + 3]),
                         (a[0 * 4 + 3] * b[3 * 4 + 0]) + (a[1 * 4 + 3] * b[3 * 4 + 1]) + (a[2 * 4 + 3] * b[3 * 4 + 2]) + (a[3 * 4 + 3] * b[3 * 4 + 3])};
            return m4(r);
        }

        /**
         * 透视投影矩阵
         */
        static m4 perspective(float fieldOfViewInRadians, float aspect, float near, float far)
        {
            float f = tan(M_PI * 0.5 - 0.5 * fieldOfViewInRadians);
            float rangeInv = 1.0 / (near - far);
            int r[16] = {f / aspect, 0, 0, 0,
                         0, f, 0, 0,
                         0, 0, (near + far) * rangeInv, -1,
                         0, 0, near * far * rangeInv * 2, 0};
            return m4(r);
        }

        /**
         * 转换坐标(未测试)
         * @param w 宽
         * @param h 高
         * @param d 深
         */
        static m4 projection(float w, float h, float d)
        {
            int r[16] = {
                2 / w, 0, 0, 0,
                0, -2 / h, 0, 0,
                0, 0, 2 / d, 0,
                -1, 1, 0, 1};
            return m4(r);
        }

        /*
        以下矩阵变换经过优化
        可能提供效率 未经过效率测试
        */

        /**
         * 平移矩阵
         * 将改变原矩阵
         */
        m4 &translation(float x, float y, float z)
        {
            a[3 * 4 + 0] +=
                x * a[0 * 4 + 0] +
                y * a[1 * 4 + 0] +
                z * a[2 * 4 + 0];
            a[3 * 4 + 1] +=
                x * a[0 * 4 + 1] +
                y * a[1 * 4 + 1] +
                z * a[2 * 4 + 1];
            a[3 * 4 + 2] +=
                x * a[0 * 4 + 2] +
                y * a[1 * 4 + 2] +
                z * a[2 * 4 + 2];
            a[3 * 4 + 3] +=
                x * a[0 * 4 + 3] +
                y * a[1 * 4 + 3] +
                z * a[2 * 4 + 3];
            return *this;
        }
        /**
         * 绕x轴旋转矩阵
         * 将改变原矩阵
         * 此函数不返回矩阵本身
         */
        void rotateX(float rx)
        {
            /*
                1, 0,  0, 0,
                0, c,  s, 0,
                0, -s, c, 0,
                0, 0,  0, 1
            */
            float cosX = cos(rx),
                  sinX = sin(rx),
                  l0 = a[1 * 4 + 0],
                  l1 = a[1 * 4 + 1],
                  l2 = a[1 * 4 + 2],
                  l3 = a[1 * 4 + 3],
                  r0 = a[2 * 4 + 0],
                  r1 = a[2 * 4 + 1],
                  r2 = a[2 * 4 + 2],
                  r3 = a[2 * 4 + 3];
            a[1 * 4 + 0] = l0 * cosX + r0 * sinX;
            a[1 * 4 + 1] = l1 * cosX + r1 * sinX;
            a[1 * 4 + 2] = l2 * cosX + r2 * sinX;
            a[1 * 4 + 3] = l3 * cosX + r3 * sinX;
            a[2 * 4 + 0] = r0 * cosX - l0 * sinX;
            a[2 * 4 + 1] = r1 * cosX - l1 * sinX;
            a[2 * 4 + 2] = r2 * cosX - l2 * sinX;
            a[2 * 4 + 3] = r3 * cosX - l3 * sinX;
        }
        /**
         * 绕y轴旋转矩阵
         * 将改变原矩阵
         * 此函数不返回矩阵本身
         */
        void rotateY(float ry)
        {
            /*
                c, 0, -s, 0,
                0, 1, 0,  0,
                s, 0, c,  0,
                0, 0, 0,  1
            */
            float cosY = cos(ry),
                  sinY = sin(ry),
                  l0 = a[0 * 4 + 0],
                  l1 = a[0 * 4 + 1],
                  l2 = a[0 * 4 + 2],
                  l3 = a[0 * 4 + 3],
                  r0 = a[2 * 4 + 0],
                  r1 = a[2 * 4 + 1],
                  r2 = a[2 * 4 + 2],
                  r3 = a[2 * 4 + 3];
            a[0 * 4 + 0] = l0 * cosY - r0 * sinY;
            a[0 * 4 + 1] = l1 * cosY - r1 * sinY;
            a[0 * 4 + 2] = l2 * cosY - r2 * sinY;
            a[0 * 4 + 3] = l3 * cosY - r3 * sinY;
            a[2 * 4 + 0] = r0 * cosY + l0 * sinY;
            a[2 * 4 + 1] = r1 * cosY + l1 * sinY;
            a[2 * 4 + 2] = r2 * cosY + l2 * sinY;
            a[2 * 4 + 3] = r3 * cosY + l3 * sinY;
        }
        /**
         * 绕z轴旋转矩阵
         * 将改变原矩阵
         * 此函数不返回矩阵本身
         */
        void rotateZ(float rz)
        {
            /*
                c,  s, 0, 0,
                -s, c, 0, 0,
                0,  0, 1, 0,
                0,  0, 0, 1
            */
            float cosZ = cos(rz),
                  sinZ = sin(rz),
                  l0 = a[0 * 4 + 0],
                  l1 = a[0 * 4 + 1],
                  l2 = a[0 * 4 + 2],
                  l3 = a[0 * 4 + 3],
                  r0 = a[1 * 4 + 0],
                  r1 = a[1 * 4 + 1],
                  r2 = a[1 * 4 + 2],
                  r3 = a[1 * 4 + 3];
            a[0 * 4 + 0] = l0 * cosZ + r0 * sinZ;
            a[0 * 4 + 1] = l1 * cosZ + r1 * sinZ;
            a[0 * 4 + 2] = l2 * cosZ + r2 * sinZ;
            a[0 * 4 + 3] = l3 * cosZ + r3 * sinZ;
            a[1 * 4 + 0] = r0 * cosZ - l0 * sinZ;
            a[1 * 4 + 1] = r1 * cosZ - l1 * sinZ;
            a[1 * 4 + 2] = r2 * cosZ - l2 * sinZ;
            a[1 * 4 + 3] = r3 * cosZ - l3 * sinZ;
        }
        /**
         * 旋转矩阵
         * 将改变原矩阵
         */
        m4 &rotate(float rx, float ry, float rz)
        {
            rotateX(rx);
            rotateY(ry);
            rotateZ(rz);
            return *this;
        }

        /**
         * 缩放矩阵
         * 将改变原矩阵
         */
        m4 &scale(float sx, float sy, float sz)
        {
            a[0 * 4 + 0] *= sx;
            a[0 * 4 + 1] *= sx;
            a[0 * 4 + 2] *= sx;
            a[0 * 4 + 3] *= sx;
            a[1 * 4 + 0] *= sy;
            a[1 * 4 + 1] *= sy;
            a[1 * 4 + 2] *= sy;
            a[1 * 4 + 3] *= sy;
            a[2 * 4 + 0] *= sz;
            a[2 * 4 + 1] *= sz;
            a[2 * 4 + 2] *= sz;
            a[2 * 4 + 3] *= sz;
            return *this;
        }
    };
}