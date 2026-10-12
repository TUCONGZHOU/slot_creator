import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';

@ccclass('LevelF_Symbol_Ctrl')
export class LevelF_Symbol_Ctrl extends BaseSymbolUnit {
    
    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }
}


