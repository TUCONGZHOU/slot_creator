import { _decorator, Component, Node,instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { ResMgr } from '../../Mgr/ResMgr';

@ccclass('LevelJT_UIBg_Ctrl')
export class LevelJT_UIBg_Ctrl extends UICtrl {

    protected initView(): void {

    }

    start() {
        console.log("--------> 添加背景");
    }

    update(deltaTime: number) {
        
    }
}


