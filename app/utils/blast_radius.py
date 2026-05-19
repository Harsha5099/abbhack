import networkx as nx


class DependencyGraph:

    def __init__(self):

        self.graph = nx.DiGraph()

    # Add dependency relationship
    def update_dependency(
        self,
        source,
        target
    ):

        self.graph.add_edge(
            source,
            target
        )

    # Get blast radius
    def get_blast_radius(
        self,
        pod
    ):

        return list(
            nx.descendants(
                self.graph,
                pod
            )
        )


# ===================================
# GLOBAL GRAPH INSTANCE
# ===================================

dependency_graph = DependencyGraph()


# ===================================
# SAMPLE RELATIONSHIPS
# ===================================

dependency_graph.update_dependency(
    "frontend",
    "api"
)

dependency_graph.update_dependency(
    "api",
    "database"
)

dependency_graph.update_dependency(
    "api",
    "redis"
)


# ===================================
# FUNCTION USED BY ROUTES
# ===================================

def calculate_blast_radius(pod):

    return dependency_graph.get_blast_radius(
        pod
    )