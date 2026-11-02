import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../../GameBase/BaseGameModel';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ActionType } from '../../InterFace/LevelConfig';

// -- 后端盘面方向：true = 第 0 个是最上面一行；false = 第 0 个是最下面一行(引擎内部约定)
const SERVER_REEL_TOP_TO_BOTTOM: boolean = false;

export class LevelTR_GameModel extends BaseGameModel {
    private m_collect:any = null;

    public parseData( data:any ):void{
        super.parseData( this.normalizeReelOrder(data) );
    }

    // -- 把后端的盘面方向统一转换成引擎内部的"从下往上"
    private normalizeReelOrder(data: any): any {
        if (data == null || SERVER_REEL_TOP_TO_BOTTOM == false) {
            return data;
        }
        const copy: any = { ...data };
        copy.reels = this.flipTables(data.reels);
        copy.respinReels = this.flipTables(data.respinReels);
        copy.freeSpinReels = this.flipTables(data.freeSpinReels);
        copy.lines = this.flipLines(data.lines, data.reels);
        copy.storedIcons = this.flipStoredIcons(data.storedIcons, data.reels);
        return copy;
    }

    // -- 每列的数组整体反转 (table -> 列 -> 行)
    private flipTables(tables: any): any {
        if (tables == null) {
            return tables;
        }
        return tables.map((cols: number[][]) => cols.map((rows: number[]) => rows.slice().reverse()));
    }

    // -- 中奖线的 row 也要跟着翻
    private flipLines(lines: any, reels: any): any {
        if (lines == null || reels == null || lines.length == 0) {
            return lines;
        }
        const rowCount: number = reels[0][0].length;
        const flipLine = (line: any) => ({ ...line, row: rowCount - 1 - line.row });
        // -- 兼容一维结构：lines 本身就是一组线
        if (Array.isArray(lines[0]) == false) {
            return lines.map(flipLine);
        }
        return lines.map((tableLines: any[]) => tableLines.map(flipLine));
    }

    // -- bonus 图标上的数字是带坐标的 也要翻
    private flipStoredIcons(storedIcons: any, reels: any): any {
        if (storedIcons == null || reels == null) {
            return storedIcons;
        }
        const rowCount: number = reels[0][0].length;
        const copy: any = {};
        for (const tableIndex in storedIcons) {
            const tableIcons = storedIcons[tableIndex];
            if (Array.isArray(tableIcons) == false) {
                copy[tableIndex] = tableIcons;
                continue;
            }
            copy[tableIndex] = tableIcons.map((icon: any) => ({
                ...icon,
                row: rowCount - 1 - icon.row
            }));
        }
        return copy;
    }

    // 重写基类
    public noticeEventToView():void {
        let action = this.getAction();
        let nextAction = this.getNextAction();

        if(action == ActionType.BONUS){
            GlEventMgr.Instance.emit(EventName.View_LevelSpin_bonus);
        }else {
            GlEventMgr.Instance.emit(EventName.View_LevelSpin_responese);
        }
    }

}


