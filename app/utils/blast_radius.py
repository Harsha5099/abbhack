import networkx as nx
import requests

BASE_URL = "https://payment-surfboard-think.ngrok-free.dev"

session = requests.Session()
session.headers.update({"ngrok-skip-browser-warning": "true"})


class DependencyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def update_dependency(self, source, target):
        self.graph.add_edge(source, target)

    def get_blast_radius(self, pod):
        if pod in self.graph:
            return list(nx.descendants(self.graph, pod))
        # prefix match — "frontend-759775d795-rjtdf" matches base "frontend"
        pod_base = pod.split("-")[0]
        for node in self.graph.nodes:
            node_base = node.split("-")[0]
            if pod_base == node_base:
                return list(nx.descendants(self.graph, node))
        return []


dependency_graph = DependencyGraph()

# Known microservice dependency map (base service names)
SERVICE_DEPS = {
    "frontend":               ["productcatalogservice", "cartservice", "recommendationservice",
                               "checkoutservice", "adservice", "currencyservice"],
    "checkoutservice":        ["paymentservice", "emailservice", "cartservice",
                               "productcatalogservice", "currencyservice", "shippingservice"],
    "cartservice":            ["redis"],
    "recommendationservice":  ["productcatalogservice"],
    "loadgenerator":          ["frontend"],
    "productcatalogservice":  [],
    "adservice":              [],
    "paymentservice":         [],
    "emailservice":           [],
    "currencyservice":        [],
    "shippingservice":        [],
    "redis":                  [],
}


def _build_graph_from_pods():
    """Fetch live pods and wire dependency edges using full pod names."""
    try:
        resp = session.get(f"{BASE_URL}/pods", timeout=8)
        resp.raise_for_status()
        pods = resp.json()
        if not isinstance(pods, list):
            pods = pods.get("pods", pods.get("items", []))

        # Map base name → full pod name
        base_to_full = {}
        for p in pods:
            full = p.get("name", "")
            base = full.split("-")[0]
            base_to_full[base] = full
            dependency_graph.graph.add_node(full)

        # Wire edges
        for src_base, targets in SERVICE_DEPS.items():
            src_full = base_to_full.get(src_base, src_base)
            for tgt_base in targets:
                tgt_full = base_to_full.get(tgt_base, tgt_base)
                dependency_graph.update_dependency(src_full, tgt_full)

        print(f"[blast_radius] ✓ Graph built — {dependency_graph.graph.number_of_nodes()} nodes, "
              f"{dependency_graph.graph.number_of_edges()} edges")

    except Exception as e:
        print(f"[blast_radius] Graph build failed: {e} — using static fallback")
        for src, targets in SERVICE_DEPS.items():
            for tgt in targets:
                dependency_graph.update_dependency(src, tgt)


_build_graph_from_pods()


def calculate_blast_radius(pod: str):
    affected = dependency_graph.get_blast_radius(pod)
    if not affected:
        _build_graph_from_pods()
        affected = dependency_graph.get_blast_radius(pod)
    return affected
