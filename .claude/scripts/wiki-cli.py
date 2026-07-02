#!/usr/bin/env python3
"""
Wiki CLI Wrapper — Safe interface to obsidian-cli for wiki operations.

Encapsulates obsidian-cli commands with error handling, output parsing,
and analysis helpers for orphan detection, link validation, tag analysis, etc.

Usage:
  wiki-cli orphans [--vault PATH] [--json] [--verbose]
  wiki-cli unresolved [--vault PATH] [--json]
  wiki-cli tags [--vault PATH] [--min-count N] [--json]
  wiki-cli backlinks FILE [--vault PATH] [--json]
  wiki-cli deadends [--vault PATH] [--json]
  wiki-cli hubs [--vault PATH] [--threshold N] [--json]
  wiki-cli structure [--vault PATH] [--full]
  wiki-cli health [--vault PATH]
"""

import subprocess
import json
import sys
import os
from pathlib import Path
from collections import defaultdict
from typing import Optional, List, Dict, Any
import argparse

class WikiCLI:
    def __init__(self, vault_path: Optional[str] = None):
        self.vault_path = vault_path or os.environ.get("OBSIDIAN_VAULT_PATH", ".")
        self.obsidian_cmd = ["obsidian", f'vault="{self.vault_path}"']

    def run(self, *args, format_json=False) -> Dict[str, Any]:
        """Run obsidian command and parse output."""
        cmd = self.obsidian_cmd + list(args)
        if format_json:
            cmd.append("format=json")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=30
            )
            if format_json:
                try:
                    return json.loads(result.stdout)
                except json.JSONDecodeError:
                    return {"raw": result.stdout}
            return {"output": result.stdout.strip()}
        except subprocess.TimeoutExpired:
            return {"error": f"Command timed out: {' '.join(cmd)}"}
        except subprocess.CalledProcessError as e:
            return {"error": f"Command failed: {e.stderr}"}

    def orphans(self, verbose=False) -> Dict[str, Any]:
        """Find orphaned pages (no incoming links)."""
        result = self.run("orphans", "total", format_json=True)

        if "error" in result:
            return result

        # Parse JSON response
        orphans_list = result.get("orphans", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            orphans_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "orphans": orphans_list,
            "count": len(orphans_list),
            "severity": "high" if len(orphans_list) > 0 else "ok"
        }

    def unresolved(self, verbose=False) -> Dict[str, Any]:
        """Find broken wikilinks (targets that don't exist)."""
        result = self.run("unresolved", "total", format_json=True)

        if "error" in result:
            return result

        unresolved_list = result.get("unresolved", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            unresolved_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "unresolved": unresolved_list,
            "count": len(unresolved_list),
            "severity": "high" if len(unresolved_list) > 0 else "ok"
        }

    def tags(self, min_count=1, sort="count") -> Dict[str, Any]:
        """Analyze tags — find clusters, frequency, orphaned tags."""
        result = self.run("tags", "counts", f"sort={sort}", "format=json")

        if "error" in result:
            return result

        tags_data = result
        if "output" in result:
            # Parse text output if JSON failed
            tags_data = {}
            for line in result["output"].split('\n'):
                if ':' in line:
                    tag, count = line.rsplit(':', 1)
                    try:
                        tags_data[tag.strip()] = int(count.strip())
                    except ValueError:
                        pass

        # Filter by min_count and detect clusters
        filtered = {k: v for k, v in tags_data.items() if v >= min_count}
        clusters = self._detect_tag_clusters(filtered)

        return {
            "tags": filtered,
            "total": len(filtered),
            "clusters": clusters,
            "orphaned": {k: v for k, v in filtered.items() if v == 1}
        }

    def _detect_tag_clusters(self, tags: Dict[str, int]) -> Dict[str, List[str]]:
        """Detect related tag groups (e.g., go-*, testing-*, etc)."""
        clusters = defaultdict(list)

        for tag in tags:
            # Extract prefix (part before dash or underscore)
            prefix = tag.split('-')[0] if '-' in tag else tag.split('_')[0]
            if prefix and len(prefix) > 2:  # Only cluster meaningful prefixes
                clusters[prefix].append(tag)

        # Only return clusters with >1 member
        return {k: v for k, v in clusters.items() if len(v) > 1}

    def deadends(self) -> Dict[str, Any]:
        """Find dead-end pages (no outgoing links)."""
        result = self.run("deadends", "total", format_json=True)

        if "error" in result:
            return result

        deadends_list = result.get("deadends", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            deadends_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "deadends": deadends_list,
            "count": len(deadends_list),
            "severity": "low" if len(deadends_list) < 20 else "medium"
        }

    def backlinks(self, file_path: str) -> Dict[str, Any]:
        """Find all pages that link to a given file."""
        result = self.run("backlinks", f'file="{file_path}"', "format=json")

        if "error" in result:
            return result

        backlinks_list = result.get("backlinks", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            backlinks_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "file": file_path,
            "backlinks": backlinks_list,
            "count": len(backlinks_list)
        }

    def hubs(self, threshold=3) -> Dict[str, Any]:
        """Detect hub pages — highly connected pages that serve as information hubs."""
        # Hub detection uses backlink count threshold
        result = self.run("orphans", "counts", "format=json")

        if "error" in result:
            return result

        # We need to analyze backlinks manually since obsidian-cli doesn't have a direct hub command
        # For now, return structure for manual analysis
        return {
            "message": "Hub detection requires analyzing backlink counts across vault",
            "threshold": threshold,
            "note": "Use backlinks command on high-traffic pages to confirm"
        }

    def links(self, file_path: str) -> Dict[str, Any]:
        """Get all outgoing links from a file."""
        result = self.run("links", f'file="{file_path}"', "format=json")

        if "error" in result:
            return result

        links_list = result.get("links", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            links_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "file": file_path,
            "links": links_list,
            "count": len(links_list)
        }

    def files(self, extension="md") -> Dict[str, Any]:
        """List all files in vault."""
        result = self.run("files", f"ext={extension}", "total", "format=json")

        if "error" in result:
            return result

        files_list = result.get("files", []) if isinstance(result, dict) else []
        if isinstance(result.get("raw"), str):
            files_list = [line.strip() for line in result["raw"].split('\n') if line.strip()]

        return {
            "files": files_list,
            "total": len(files_list),
            "extension": extension
        }

    def vault_info(self) -> Dict[str, Any]:
        """Get vault metadata."""
        result = self.run("vault", "info=name|path|files|folders|size")

        if "error" in result:
            return result

        return {"vault_info": result.get("output", "")}

    def health_check(self) -> Dict[str, Any]:
        """Run complete health check — orphans, unresolved, deadends, tag clusters."""
        orphans = self.orphans()
        unresolved = self.unresolved()
        deadends = self.deadends()
        tags = self.tags(min_count=1)
        vault = self.vault_info()

        issues = []
        if orphans.get("count", 0) > 0:
            issues.append(f"🔴 {orphans['count']} orphaned pages")
        if unresolved.get("count", 0) > 0:
            issues.append(f"🔴 {unresolved['count']} unresolved links")
        if deadends.get("count", 0) > 5:
            issues.append(f"🟡 {deadends['count']} dead-end pages")
        if tags.get("orphaned", {}):
            issues.append(f"🟡 {len(tags['orphaned'])} orphaned tags")

        return {
            "vault": vault,
            "issues": issues,
            "summary": {
                "orphans": orphans.get("count", 0),
                "unresolved": unresolved.get("count", 0),
                "deadends": deadends.get("count", 0),
                "orphaned_tags": len(tags.get("orphaned", {}))
            },
            "status": "healthy" if not issues else "needs_attention"
        }

    def structure_analysis(self, full=False) -> Dict[str, Any]:
        """Analyze wiki structure — categories, connections, patterns."""
        files = self.files()
        tags = self.tags(min_count=1)
        orphans = self.orphans()

        # Count files by directory
        categories = defaultdict(int)
        if files.get("files"):
            for f in files["files"]:
                # Extract directory from file path
                parts = f.split('/')
                if len(parts) > 1:
                    categories[parts[0]] += 1
                else:
                    categories["root"] += 1

        result = {
            "categories": dict(categories),
            "total_files": files.get("total", 0),
            "tag_clusters": tags.get("clusters", {}),
            "orphans": orphans.get("count", 0),
            "structure_score": self._calculate_structure_score(categories, tags, orphans)
        }

        if full:
            result["tag_analysis"] = tags
            result["orphan_details"] = orphans

        return result

    def _calculate_structure_score(self, categories: Dict, tags: Dict, orphans: Dict) -> float:
        """Score wiki structure health (0-100)."""
        score = 100.0

        # Penalize orphaned pages (most important)
        if orphans.get("count", 0) > 0:
            score -= min(30, orphans["count"] * 3)

        # Penalize unbalanced categories
        if categories:
            counts = list(categories.values())
            max_count = max(counts)
            min_count = min(counts)
            if max_count > 0 and min_count / max_count < 0.1:
                score -= 10

        # Reward good tag usage
        if tags.get("tags", {}):
            if tags["total"] > 10:
                score += 5

        return max(0, min(100, score))


def main():
    parser = argparse.ArgumentParser(description="Wiki CLI Wrapper")
    parser.add_argument("command", choices=[
        "orphans", "unresolved", "tags", "backlinks", "deadends",
        "hubs", "links", "files", "vault", "health", "structure"
    ])
    parser.add_argument("--vault", help="Obsidian vault path")
    parser.add_argument("--file", help="File path for file-specific commands")
    parser.add_argument("--min-count", type=int, default=1, help="Minimum tag count")
    parser.add_argument("--threshold", type=int, default=3, help="Hub detection threshold")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--full", action="store_true", help="Full analysis")

    args = parser.parse_args()

    cli = WikiCLI(vault_path=args.vault)

    if args.command == "orphans":
        result = cli.orphans(verbose=args.verbose)
    elif args.command == "unresolved":
        result = cli.unresolved(verbose=args.verbose)
    elif args.command == "tags":
        result = cli.tags(min_count=args.min_count)
    elif args.command == "backlinks":
        result = cli.backlinks(args.file or "")
    elif args.command == "deadends":
        result = cli.deadends()
    elif args.command == "hubs":
        result = cli.hubs(threshold=args.threshold)
    elif args.command == "links":
        result = cli.links(args.file or "")
    elif args.command == "files":
        result = cli.files()
    elif args.command == "vault":
        result = cli.vault_info()
    elif args.command == "health":
        result = cli.health_check()
    elif args.command == "structure":
        result = cli.structure_analysis(full=args.full)
    else:
        result = {"error": f"Unknown command: {args.command}"}

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
