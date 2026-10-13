import { _decorator, Component, Node,Animation } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelJT_MainUI_Ctrl } from './LevelJT_MainUI_Ctrl';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';

@ccclass('LevelJT_FreeSpinView_Ctrl')
export class LevelJT_FreeSpinView_Ctrl extends UICtrl {

    private m_mainCtrl:LevelJT_MainUI_Ctrl = null;
    protected initView(): void {
        this.addButtonClick("SpriteSplash", this, this.clickFreeView);
    }

    start() {
        // 播放动画
        // let animation = this.view["315_FG_FreeStart"].getComponent(Animation);
        // animation.play("freespinview");
    }

    update(deltaTime: number) {
        
    }

    public initUI(levelConfig:LevelConfig,mainCtrl:LevelJT_MainUI_Ctrl){
        this.m_mainCtrl = mainCtrl;
    }

    public clickFreeView():void {
        // 移除当前轮盘
        this.m_mainCtrl.removeGameTable();
        // 添加freespin的轮盘
        this.m_mainCtrl.addFreeSpinGameTableUI();
        // 恢复点击
        GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        // 发送消息
        GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        // 改变bg
        GlEventMgr.Instance.emit(EventName.ChangeBg,false);
        // 发送消息 开始滚动
        GlEventMgr.Instance.emit(EventName.StartSpinBtn);

        // 关闭freespin界面
        UIMgr.Instance.closeUi("LevelJT_FreeSpinView_Ctrl");
    }

    // 在销毁时手动清理引用
    protected onDestroy(): void {
        // 清理对主控制器的引用
        this.m_mainCtrl = null;
        
        // 调用父类方法
        super.onDestroy();
    }
}


