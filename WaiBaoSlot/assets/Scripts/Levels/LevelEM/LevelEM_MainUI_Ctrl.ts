import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';

@ccclass('LevelEM_MainUI_Ctrl')
export class LevelEM_MainUI_Ctrl extends BaseGameMain {

    protected initView(): void {
        super.initView();
    }

    start() {
        // 调用基类
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // -- 刚进入游戏 根据状态切换轮盘
    public changeGameTableByEnter():void{
        // 调用基类
        super.changeGameTableByEnter();
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action == ActionType.NORMAL){
            // 根据数据显示轮盘上的信号块 显示Normal轮盘 
            this.addNormalGameTableUI();
        }
    }

    // -- 进入respin
    public enterReSpin():void{
        // 移除当前轮盘
        this.removeGameTable();
        // 添加respin的轮盘
        this.addRespinGameTableUI();
    }
}


