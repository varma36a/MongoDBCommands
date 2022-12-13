var bulk1 = db.getCollection("Equipment").initializeOrderedBulkOp();
var bulk2 = db.getCollection("History").initializeOrderedBulkOp();

const count = 0;
db.getCollection("EquipmentAudit")
  .find({})
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

    count++;
  });

db.getCollection("HistoryAudit")
  .find({})
  .forEach(function (l2) {
    l2.events.forEach(function (l3) {
      bulk2
        .find({ _id: l2._id })
        .upsert()
        .updateOne({
          $setOnInsert: {
            _id: l2._id,
            events: [
              {
                datetime: l3.datetime,
                activityType: l3.activityType,
                username: l3.username,
                locationId: l3.locationId,
                subscriberId: l3.subscriberId,
                dropshipOrderNumber: l3.dropshipOrderNumber,
              },
            ],
          },
        });
    });
    count++;
  });

// Clean up queues
if (count > 0) {
  bulk1.execute();
  bulk2.execute();
}
