#[starknet::component]
pub mod InitializableComponent {
    // Imports

    use achievement::component::Component as AchievementComponent;
    use achievement::component::Component::InternalImpl as AchievementInternalImpl;
    use dojo::world::WorldStorage;
    use quest::component::Component as QuestableComponent;
    use quest::component::Component::InternalImpl as QuestableInternalImpl;
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, AchievementType, IAchievement};
    use crate::elements::quests::index::{IQuest, QUEST_COUNT, QuestProps, QuestType};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievement: AchievementComponent::HasComponent<TContractState>,
        impl AchievementImpl: AchievementComponent::AchievementTrait<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl QuestImpl: QuestableComponent::QuestTrait<TContractState>,
    > of InternalTrait<TContractState> {
        /// Creates all achievements.
        fn create_achievements(ref self: ComponentState<TContractState>, mut world: WorldStorage) {
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            while achievement_id > 0 {
                let achievement_type: AchievementType = achievement_id.into();
                let props = achievement_type.props();
                achievement
                    .create(
                        world,
                        id: props.id,
                        start: 0,
                        end: 0,
                        tasks: props.tasks,
                        metadata: props.metadata,
                        to_store: true,
                    );
                achievement_id -= 1;
            }
        }

        /// Creates all quests.
        fn create_quests(ref self: ComponentState<TContractState>, mut world: WorldStorage) {
            let mut quest_id: u8 = QUEST_COUNT;
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let registry = starknet::get_contract_address();
            while quest_id > 0 {
                let quest_type: QuestType = quest_id.into();
                let props: QuestProps = quest_type.props(registry);
                quest
                    .create(
                        world: world,
                        id: props.id,
                        start: props.start,
                        end: props.end,
                        duration: props.duration,
                        interval: props.interval,
                        tasks: props.tasks.span(),
                        conditions: props.conditions.span(),
                        metadata: props.metadata,
                        to_store: true,
                    );
                quest_id -= 1;
            };
        }
    }
}
