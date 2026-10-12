import { _decorator, Component, Node } from 'cc';

export enum SymbolType {
    COMMON = "common",
    SCATTER = "scatter",
    WILD = "wild",
    BONUS = "bonus",
}

export enum ActionType {
    NORMAL = "NORMAL",
    FREESPIN = "FREESPIN",
    RESPIN = "RESPIN",
    BONUS = "BONUS",
}

export enum ResourceType {
    Prefab = "Prefab",
    Spine = "Spine"
}

export enum SymbolViewType {
    View = "view",
    Bottom = "bottom",
    Top = "top"
}

export interface StoredIconStruct{
    col:number,
    row:number,
    Multiple:number
}

export interface SymbolRollData{
    id:number; // id:信号块的id
    col:number; // col:所在的列 -- 假滚的时候没有这个数据
    row:number; // row:所在的行 -- 假滚的时候没有这个数据
    posType:string; // posType:有bottom view top 三种类型 -- 假滚的时候没有这个数据
    pos:number; // pos:标记大信号块 pos>1不渲染 表示空信号块 <此值可能也没有 比如创建用于显示的动画的时候>
}

export interface LevelConfig {
    BundleName:string;
    MainPrefabs:string;
    BgPrefabs:string;
    BgCompent:string;
    Symbol:SymbolConfig[];
    SymbolSize:Record<string,number>;
    ToFeature:Record<string,boolean>;
    SymbolLineAction:Record<string,string>;
    SymbolStopAction:Record<string,string>;
    SymbolIdleAction:Record<string,string>;
    GameTable:Record<string,GameTableConfig>;
    ReelTable:Record<string,ReelTableConfig>;
    ReelUnit:Record<string,ReelUnitConfig>;
    Effect:EffectConfig[];
    SoundsLineFile:string[];
    SoundsFile:Record<string,string>;
    SpinJson:string[];
    OtherPrefabs:string[];
    SpriteFrame:string[];
}

export interface SymbolConfig {
    id:number;
    file:string;
    type:SymbolType;
    grid:number;
    rstype:ResourceType;
    count:number;
    zorder:number;
    sizeType:number;
    actype:string;
}

export interface EffectConfig {
    name:string;
    file:string;
    count:number;
    actionName:string;
}

export interface GameTableConfig{
    Compent:string;
    Prefabs:string;
    ReelTables:string[];
}

export interface ReelTableConfig{
    ClipType:number;
    Compent:string;
    Prefabs:string;
    ReelUnits:string[];
    RollData:number[][];
    QuickActionTime:number;
}

export interface ReelUnitConfig{
    Width:number;
    Height:number;
    ViewCount:number;
    Speed:number;
    QuickSpeed:number;
    QuickStopSpeed:number;
    Compent:string;
    BigSize:number;
}


