package planning

type Policy struct {
	strategy Strategy
}

func NewPolicy(strategy Strategy) Policy {
	if strategy == nil {
		strategy = GreedyStrategy{}
	}
	return Policy{strategy: strategy}
}

func (p Policy) BuildPlan(input BuildPlanInput) BuildPlanResult {
	return p.strategy.BuildPlan(input)
}
