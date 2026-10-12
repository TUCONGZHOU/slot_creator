import { _decorator, Component, Node } from 'cc';
import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType, LevelConfig } from '../../InterFace/LevelConfig';

const { ccclass, property } = _decorator;

@ccclass('LevelF_MainUI_Ctrl')
export class LevelF_MainUI_Ctrl extends BaseGameMain {
    
    start() {
        // 调用基类
        super.start();
    }

    update(deltaTime: number) {
        
    }

    // -- 刚进入游戏 根据状态切换轮盘
    public changeGameTableByEnter():void{
        // 调用基类
        super.changeGameTableByEnter();

        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action == ActionType.NORMAL){
            // 根据数据显示轮盘上的信号块 显示Normal轮盘 
            console.log("=========> 显示GameNormal轮盘")
            this.addNormalGameTableUI();
        }
    }
}


