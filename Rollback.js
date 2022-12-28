var bulk1 = db.getCollection("Equipment").initializeOrderedBulkOp();
var bulk2 = db.getCollection("History").initializeOrderedBulkOp();

const count1 = 0;
const count2 = 0;

db.getCollection("EquipmentAudit")
  .find()
  .forEach(function (l1) {
    bulk1
      .find({ _id: l1._id })
      .upsert()
      .updateOne({
        $setOnInsert: {
          _id: l1._id,
          locationId: l1.locationId,
          subscriberId: l1.subscriberId,
          status: l1.status,
          model: l1.model,
          receivedDate: l1.receivedDate,
        },
      });

    count1++;
  });

db.getCollection("HistoryAudit")
  .find()
  .forEach(function (l2) {
    bulk2
      .find({ _id: l2._id })
      .upsert()
      .updateOne({
        $setOnInsert: {
          _id: l2._id,
          events: [...l2.events],
        },
      });

    count2++;
  });

// Clean up queues
if (count1 > 0) {
  bulk1.execute();
}
if (count2 > 0) {
  bulk2.execute();
}
