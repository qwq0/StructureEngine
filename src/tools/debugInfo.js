export var debugInfo = {
    /**
     * 视锥剔除的物体数
     * @type {number}
     */
    cullCount: 0,

    /**
     * 每次渲染前清除
     */
    clear: function ()
    {
        this.cullCount = 0;
    }
};