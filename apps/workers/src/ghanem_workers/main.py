"""Entrypoint untuk Ghanem.one spatial worker.

Saat ini hanya placeholder yang log "ready" + idle. Implementasi BullMQ consumer
loop akan ditambahkan di Phase 9 Week 1-2 (SHP import sebagai job pertama).
"""

from __future__ import annotations

import logging
import os
import signal
import sys
import time
from types import FrameType

logger = logging.getLogger("ghanem.workers")


def _configure_logging() -> None:
    """Configure structured JSON logging ke stdout untuk Loki aggregation."""
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=log_level,
        format='{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
        stream=sys.stdout,
    )


def _handle_sigterm(_signum: int, _frame: FrameType | None) -> None:
    """Graceful shutdown — release queue locks, flush in-flight jobs."""
    logger.info("SIGTERM diterima, shutting down worker.")
    sys.exit(0)


def main() -> int:
    """Worker entrypoint. Lihat ADR 0001 untuk arsitektur queue."""
    _configure_logging()
    signal.signal(signal.SIGTERM, _handle_sigterm)
    signal.signal(signal.SIGINT, _handle_sigterm)

    worker_id = os.environ.get("WORKER_ID", "worker-0")
    logger.info("Ghanem.one worker %s ready. (Phase 7 placeholder)", worker_id)

    # Phase 9: ganti idle loop dengan BullMQ consumer (poll Redis queue 'ghanem:jobs').
    while True:
        time.sleep(60)


if __name__ == "__main__":
    raise SystemExit(main())
