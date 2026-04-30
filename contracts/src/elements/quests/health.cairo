use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::composer::Immortal5;
use super::index::{INTERVAL_HARD, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl FieldMedic of QuestTrait {
    fn identifier() -> felt252 {
        'FIELD_MEDIC'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Field Medic",
            description: "Patch them all, leave nobody behind.",
            icon: "fa-truck-medical",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Immortal5::identifier(), 1, Immortal5::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
