/**
 * 指针数据
 * 当发生鼠标或触摸事件时传递
 * 包含指针坐标和按下状态等数据
 */
export class pointerData
{
    x = 0; y = 0; // 当前指针位置
    vx = 0; vy = 0; // 指针位置和上次位置的变化
    sx = 0; sy = 0; // 此指针的起始位置
    hold = false; // 当前此指针是否处于按下状态
    pressing = false; // 当前指针是否正在按下(按下事件)
    constructor(x, y, vx, vy, sx, sy, hold, pressing)
    {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.sx = sx;
        this.sy = sy;
        this.hold = hold;
        this.pressing = pressing;
    }
}