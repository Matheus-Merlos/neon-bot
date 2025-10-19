import Strategy from './base-strategy';
import DefaultStrategy from './generics/default';
import DeleteStrategy from './generics/delete';
import InfoStrategy from './generics/info';
import ListStrategy from './generics/list';

import CompleteObjectiveStrategy from './objectives/complete-objective';
import CreateObjectiveStrategy from './objectives/create-objective';
import ListCompletedObjectivesStrategy from './objectives/list-completed-objectives';
import SelectObjectiveStrategy from './objectives/select-objective';
import SelectedObjectivesStrategy from './objectives/selected-objectives';

import EditCharacterFieldStrategy from './character/edit-character-field';
import CompletedClassObjectiveStrategy from './class-objectives/completed';
import CreateClassObjectiveStrategy from './class-objectives/create';
import ListCompletedClassObjectivesStrategy from './class-objectives/list-completed';
import SetClassStrategy from './class-objectives/set-class';
import CreateStrategy from './generics/create';
import EditStrategy from './generics/edit';
import EditFieldStrategy from './generics/edit-field';
import EditImageStrategy from './generics/edit-img';
import PayStrategy from './gold-exp/pay';
import RewardStrategy from './gold-exp/reward';
import BuyStrategy from './item/buy';
import CreateItemStrategy from './item/create-item';
import GiveItemStrategy from './item/give';
import { default as UseStrategy } from './item/use';
import CompletedMissionStrategy from './missions/completed-mission';
import CreateMissionStrategy from './missions/create-mission';
import CreateNPCStrategy from './npc/create';
import DeleteNPCStrategy from './npc/delete';
import ListNPCStrategy from './npc/list';
import SwitchNPCStrategy from './npc/switch';
import RemoveSelectedObjectiveStrategy from './objectives/remove-selected';

export {
    BuyStrategy,
    CompletedClassObjectiveStrategy,
    CompletedMissionStrategy,
    CompleteObjectiveStrategy,
    CreateClassObjectiveStrategy,
    CreateItemStrategy,
    CreateMissionStrategy,
    CreateNPCStrategy,
    CreateObjectiveStrategy,
    CreateStrategy,
    DefaultStrategy,
    DeleteNPCStrategy,
    DeleteStrategy,
    EditCharacterFieldStrategy,
    EditFieldStrategy,
    EditImageStrategy,
    EditStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListCompletedClassObjectivesStrategy,
    ListCompletedObjectivesStrategy,
    ListNPCStrategy,
    ListStrategy,
    PayStrategy,
    RemoveSelectedObjectiveStrategy,
    RewardStrategy,
    SelectedObjectivesStrategy,
    SelectObjectiveStrategy,
    SetClassStrategy,
    Strategy,
    SwitchNPCStrategy,
    UseStrategy
};

