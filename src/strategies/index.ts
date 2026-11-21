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

import ApproveStrategy from './ai/approve';
import QuestionStrategy from './ai/question';
import EditCharacterFieldStrategy from './character/edit-character-field';
import NewGenStrategy from './character/newgen';
import ResetCharacterStrategy from './character/reset';
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
import InventoryStrategy from './inventory/inventory';
import BuyStrategy from './item/buy';
import CreateItemStrategy from './item/create-item';
import GiveItemStrategy from './item/give';
import { default as UseStrategy } from './item/use';
import CreateManaAliasStrategy from './mana/alias/create';
import DisableCharacterManaStrategy from './mana/disable';
import ManaRegenStrategy from './mana/regen';
import SetBaseManaStrategy from './mana/set-base';
import UseManaStrategy from './mana/use';
import CompletedMissionStrategy from './missions/completed-mission';
import CreateMissionStrategy from './missions/create-mission';
import CreateNPCStrategy from './npc/create';
import DeleteNPCStrategy from './npc/delete';
import ListNPCStrategy from './npc/list';
import SwitchNPCStrategy from './npc/switch';
import RemoveSelectedObjectiveStrategy from './objectives/remove-selected';
import TurnListStrategy from './rpg/turn-list';
import CreateRuleStrategy from './rules/create-rule';
import ImageSearchStrategy from './search/image';
import CreateSystemStrategy from './systems/create-system';
import CurrentManaStrategy from './mana/current';

export {
    ApproveStrategy,
    BuyStrategy,
    CompletedClassObjectiveStrategy,
    CompletedMissionStrategy,
    CompleteObjectiveStrategy,
    CreateClassObjectiveStrategy,
    CreateItemStrategy,
    CreateManaAliasStrategy,
    CreateMissionStrategy,
    CreateNPCStrategy,
    CreateObjectiveStrategy,
    CreateRuleStrategy,
    CreateStrategy,
    CreateSystemStrategy,
    DefaultStrategy,
    DeleteNPCStrategy,
    DeleteStrategy,
    DisableCharacterManaStrategy,
    EditCharacterFieldStrategy,
    EditFieldStrategy,
    EditImageStrategy,
    EditStrategy,
    GiveItemStrategy,
    ImageSearchStrategy,
    InfoStrategy,
    InventoryStrategy,
    ListCompletedClassObjectivesStrategy,
    ListCompletedObjectivesStrategy,
    ListNPCStrategy,
    ListStrategy,
    ManaRegenStrategy,
    NewGenStrategy,
    PayStrategy,
    QuestionStrategy,
    RemoveSelectedObjectiveStrategy,
    ResetCharacterStrategy,
    RewardStrategy,
    SelectedObjectivesStrategy,
    SelectObjectiveStrategy,
    SetBaseManaStrategy,
    SetClassStrategy,
    Strategy,
    SwitchNPCStrategy,
    TurnListStrategy,
    UseManaStrategy,
    UseStrategy,
    CurrentManaStrategy,
};
