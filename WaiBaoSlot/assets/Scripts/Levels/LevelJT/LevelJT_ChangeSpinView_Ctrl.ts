import { _decorator, Component, Node,Animation, Skeleton, tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelJT_MainUI_Ctrl } from './LevelJT_MainUI_Ctrl';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { Utils } from '../../Util/Utils';

@ccclass('LevelJT_ChangeSpinView_Ctrl')
export class LevelJT_ChangeSpinView_Ctrl extends UICtrl {

    private m_mainCtrl:LevelJT_MainUI_Ctrl = null;
    private m_nextType:string = ""
    protected initView(): void {

    }

    start() {
        tween(this.node)
        .delay(1.5)
        .call(()=>{
            // 移除当前轮盘
            this.m_mainCtrl.removeGameTable();
            if (this.m_nextType == "NORMAL"){
                this.m_mainCtrl.otherUIChangeToNomal();
                this.m_mainCtrl.addNormalGameTableUI();
            }else if(this.m_nextType == "FREESPIN"){
                // 添加freespin的轮盘
                this.m_mainCtrl.addFreeSpinGameTableUI();
            }else if(this.m_nextType == "RESPIN"){
                this.m_mainCtrl.addRespinGameTableUI();
            }

            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
            GlEventMgr.Instance.emit(EventName.ChangeBg,false);
        })
        .delay(0.5)
        .call(()=>{
            this.node.active = false;
            this.scheduleOnce(()=>{
                UIMgr.Instance.closeUi("LevelJT_ChangeSpinView_Ctrl");
            },0.1)
        })
        .start()
    }

    update(deltaTime: number) {

    }

    public initUI(levelConfig:LevelConfig,mainCtrl:LevelJT_MainUI_Ctrl,nextType:string){
        this.m_mainCtrl = mainCtrl;
        this.m_nextType = nextType
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
        UIMgr.Instance.closeUi("LevelJT_ChangeSpinView_Ctrl");
    }

    // 在销毁时手动清理引用
    protected onDestroy(): void {
        // 清理对主控制器的引用
        this.m_mainCtrl = null;
        
        // 调用父类方法
        super.onDestroy();
    }
}
